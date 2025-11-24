"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SYNC_INTERVAL } from "@/lib/constant";
import type { Change } from "@/service/api-sync";
import { useSync } from "@/service/api-sync";
import { collectionApi } from "@/service/local/api-collection";
import { noteApi } from "@/service/local/api-note";
import { projectApi } from "@/service/local/api-project";
import { useGetSetting, useUpsertSetting } from "@/service/local/api-setting";
import { taskApi } from "@/service/local/api-task";

export function useAutoSync() {
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: lastSyncTimeSetting } = useGetSetting("lastSyncTime");
  const { mutate: updateSetting } = useUpsertSetting({});
  const lastSyncTime = lastSyncTimeSetting?.value as string | undefined;

  const { mutate: pushChanges } = useSync({
    onSuccess: async (response) => {
      try {
        console.log("pushChanges onSuccess", response.data);
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
              syncedAt: response.data?.lastSyncTime,
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
              syncedAt: response.data?.lastSyncTime,
            });
          } else if (change.type === "note") {
            await noteApi.upsert({
              id: change.entityId,
              collectionId: change.collectionId,
              content: change.content,
              updatedAt: change.updatedAt,
              createdAt: change.createdAt,
              deletedAt: change.deletedAt,
              syncedAt: response.data?.lastSyncTime,
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
              syncedAt: response.data?.lastSyncTime,
            });
          }
        }

        console.log("upserted lastSyncTime", response.data?.lastSyncTime);

        // Update lastSyncTime
        await updateSetting({
          name: "lastSyncTime",
          value: response.data?.lastSyncTime ?? new Date(0).toISOString(),
        });
      } catch (error) {
        console.error("Error during sync:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    onError: (error) => {
      // Log error but don't delete changes - they'll be retried next sync
      console.error("Sync failed:", error);
      setIsSyncing(false);
    },
  });

  const performSync = useCallback(async () => {
    console.log("useAutoSync useEffect");
    try {
      setIsSyncing(true);
      // Fetch all entities from Dexie
      const allProjects = await projectApi.getAll({ unsynced: true });
      const allTasks = await taskApi.getAll({ unsynced: true });
      const allCollections = await collectionApi.getAll({ unsynced: true });
      const allNotes = await noteApi.getAll({ unsynced: true });

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
          content: note.content,
          collectionId: note.collectionId,
          updatedAt: note.updatedAt,
          createdAt: note.createdAt,
          deletedAt: note.deletedAt,
        });
      }

      if (allChanges.length === 0) {
        pushChanges({
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
        pushChanges({
          changes: allChanges,
          lastSyncTime: lastSyncTime ?? new Date(0).toISOString(),
        });
      }
    } catch (error) {
      console.error("Error during sync:", error);
    }
  }, [pushChanges, lastSyncTime]);

  useEffect(() => {
    intervalRef.current = setInterval(performSync, SYNC_INTERVAL);
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [performSync]);

  return {
    isSyncing,
    sync: performSync,
    lastSyncTime,
  };
}
