"use client";

import { useEffect, useRef, useState } from "react";
import { useSync } from "@/service/api-sync";
import type { Change, Change as SyncChange } from "@/service/api-sync";
import { useGetSetting, useUpdateSetting } from "@/service/local/api-setting";
import { taskApi } from "@/service/local/api-task";
import { projectApi } from "@/service/local/api-project";
import { noteApi } from "@/service/local/api-note";
import { collectionApi } from "@/service/local/api-collection";
import { db } from "@/lib/dexie";

const SYNC_INTERVAL = 5 * 1000; // 5 seconds

export function useAutoSync() {
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { data: lastSyncTimeSetting } = useGetSetting("lastSyncTime");
  const { mutate: updateSetting } = useUpdateSetting({});
  const lastSyncTime = lastSyncTimeSetting?.value as string | undefined;

  const { mutate: syncChanges, isPending: isSyncPending } = useSync({
    onSuccess: async (response) => {
      // Insert all changes to Dexie
      for (const change of response.data?.changes ?? []) {
        // Handle upsert
        if (change.type === "task") {
          await taskApi.upsert({
            id: change.entityId,
            projectId: change.projectId,
            title: change.title,
            description: change.description,
            status: change.status,
            sortOrder: change.sortOrder,
            dueDate: change.dueDate,
            updatedAt: change.updatedAt,
            createdAt: change.createdAt,
            deletedAt: change.deletedAt,
          });
        } else if (change.type === "project") {
          await projectApi.upsert({
            id: change.entityId,
            title: change.title,
            description: change.description,
            color: change.color,
            updatedAt: change.updatedAt,
            createdAt: change.createdAt,
            deletedAt: change.deletedAt,
          });
        } else if (change.type === "note") {
          await noteApi.upsert({
            id: change.entityId,
            collectionId: change.collectionId,
            title: change.title,
            content: change.content,
            updatedAt: change.updatedAt,
            createdAt: change.createdAt,
            deletedAt: change.deletedAt,
          });
        } else if (change.type === "collection") {
          await collectionApi.upsert({
            id: change.entityId,
            title: change.title,
            description: change.description,
            color: change.color,
            updatedAt: change.updatedAt,
            createdAt: change.createdAt,
            deletedAt: change.deletedAt,
          });
        }
      }

      // Update lastSyncTime
      await updateSetting({
        name: "lastSyncTime",
        value: response.data?.lastSyncTime ?? new Date(0).toISOString(),
      });

      setIsLoading(false);
    },
    onError: (error) => {
      // Log error but don't delete changes - they'll be retried next sync
      console.error("Sync failed:", error);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    const performSync = async () => {
      console.log("useAutoSync useEffect");
      try {
        // Fetch all entities from Dexie
        const allProjects = await projectApi.getAll();
        const allTasks = await taskApi.getAll();
        const allCollections = await collectionApi.getAll();
        const allNotes = await noteApi.getAll();

        const allChanges: Change[] = [];

        for (const task of allTasks) {
          allChanges.push({
            entityId: task.id,
            type: "task",
            title: task.title,
            description: task.description,
            status: task.status,
            sortOrder: task.sortOrder,
            dueDate: task.dueDate,
            updatedAt: task.updatedAt,
            createdAt: task.createdAt,
            deletedAt: task.deletedAt,
          });
        }

        for (const project of allProjects) {
          allChanges.push({
            entityId: project.id,
            type: "project",
            title: project.title,
            description: project.description,
            color: project.color,
            updatedAt: project.updatedAt,
            createdAt: project.createdAt,
            deletedAt: project.deletedAt,
          });
        }

        for (const collection of allCollections) {
          allChanges.push({
            entityId: collection.id,
            type: "collection",
            title: collection.title,
            description: collection.description,
            color: collection.color,
            updatedAt: collection.updatedAt,
            createdAt: collection.createdAt,
            deletedAt: collection.deletedAt,
          });
        }

        for (const note of allNotes) {
          allChanges.push({
            entityId: note.id,
            type: "note",
            title: note.title,
            content: note.content,
            collectionId: note.collectionId,
            updatedAt: note.updatedAt,
            createdAt: note.createdAt,
            deletedAt: note.deletedAt,
          });
        }

        if (allChanges.length === 0) {
          syncChanges({
            changes: [],
            lastSyncTime: lastSyncTime ?? new Date(0).toISOString(),
          });
          return; // No changes to sync
        }

        // sort by updatedAt
        allChanges.sort((a, b) => {
          return (
            new Date(b.updatedAt ?? new Date(0).toISOString()).getTime() -
            new Date(a.updatedAt ?? new Date(0).toISOString()).getTime()
          );
        });

        // Send all changes to server
        if (allChanges.length > 0) {
          setIsLoading(true);
          syncChanges({
            changes: allChanges,
            lastSyncTime: lastSyncTime ?? new Date(0).toISOString(),
          });
        }
      } catch (error) {
        console.error("Error during sync:", error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    intervalRef.current = setInterval(performSync, SYNC_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncChanges]);

  return {
    isLoading: isLoading || isSyncPending,
    sync: syncChanges,
    lastSyncTime,
  };
}
