"use client";

import { useEffect, useRef } from "react";
import { changeApi } from "@/service/local/api-change";
import { useSync } from "@/service/api-sync";
import type { Change as SyncChange } from "@/service/api-sync";
import type { Change as DexieChange } from "@/lib/dexie";

const SYNC_INTERVAL = 5 * 1000; // 5 seconds

export function AutoSync() {
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { mutate: syncChanges } = useSync({
    onSuccess: async () => {
      // On successful sync, delete all synced changes from Dexie
      const allChanges = await changeApi.getAll();
      for (const change of allChanges) {
        await changeApi.delete(change.id);
      }
    },
    onError: (error) => {
      // Log error but don't delete changes - they'll be retried next sync
      console.error("Sync failed:", error);
    },
  });

  useEffect(() => {
    const performSync = async () => {
      try {
        // Fetch all changes from Dexie
        const allChanges = await changeApi.getAll();

        if (allChanges.length === 0) {
          return; // No changes to sync
        }

        // Group changes by (type, entityId)
        const groupedChanges = new Map<string, DexieChange[]>();

        for (const change of allChanges) {
          const key = `${change.type}:${change.entityId}`;
          if (!groupedChanges.has(key)) {
            groupedChanges.set(key, []);
          }
          groupedChanges.get(key)!.push(change);
        }

        // Merge changes for each group
        const mergedChanges: SyncChange[] = [];

        for (const [, changes] of groupedChanges.entries()) {
          // Sort changes by updatedAt (newest first)
          const sortedChanges = [...changes].sort((a, b) => {
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          });

          // Start with base structure
          const baseChange = sortedChanges[0];
          const merged: SyncChange = {
            id: baseChange.entityId,
            type: baseChange.type,
          };

          // Track the latest updatedAt across all changes
          let latestUpdatedAt = baseChange.updatedAt;
          let oldestCreatedAt = baseChange.createdAt;

          // For each field, find the change with the newest updatedAt that has that field
          const fieldKeys: Array<
            keyof Pick<
              DexieChange,
              | "title"
              | "content"
              | "description"
              | "collectionId"
              | "color"
              | "projectId"
              | "sortOrder"
              | "dueDate"
              | "status"
              | "deletedAt"
            >
          > = [
            "title",
            "content",
            "description",
            "collectionId",
            "color",
            "projectId",
            "sortOrder",
            "dueDate",
            "status",
            "deletedAt",
          ];

          // For each field, find the newest change that has it
          for (const field of fieldKeys) {
            for (const change of sortedChanges) {
              if (change[field] !== undefined) {
                (merged as any)[field] = change[field];
                break; // Since sortedChanges is sorted newest first, take first match
              }
            }
          }

          // Find latest updatedAt and oldest createdAt
          for (const change of sortedChanges) {
            const changeTime = new Date(change.updatedAt).getTime();
            const latestTime = new Date(latestUpdatedAt).getTime();
            if (changeTime > latestTime) {
              latestUpdatedAt = change.updatedAt;
            }

            if (change.createdAt) {
              const changeCreatedTime = new Date(change.createdAt).getTime();
              const oldestTime = oldestCreatedAt
                ? new Date(oldestCreatedAt).getTime()
                : Infinity;
              if (changeCreatedTime < oldestTime) {
                oldestCreatedAt = change.createdAt;
              }
            }
          }

          merged.updatedAt = latestUpdatedAt;
          if (oldestCreatedAt) {
            merged.createdAt = oldestCreatedAt;
          }

          mergedChanges.push(merged);
        }

        // Send merged changes to server
        if (mergedChanges.length > 0) {
          syncChanges({
            changes: mergedChanges,
            lastSyncTime: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error during sync:", error);
      }
    };

    // Perform initial sync after 5 minutes
    intervalRef.current = setInterval(performSync, SYNC_INTERVAL); // 5 minutes

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncChanges]);

  // This component doesn't render anything
  return null;
}
