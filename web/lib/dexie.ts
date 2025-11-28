import Dexie, { type Table } from "dexie";

export type Task = {
  id: string;
  userId: string;
  projectId?: string | null;
  title?: string;
  description?: string;
  status: number; // 0, 1, 2, -1
  sortOrder?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncedAt?: string;
};

export type Project = {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  deletedAt?: string;
  syncedAt?: string;
};

export type Note = {
  id: string;
  userId: string;
  collectionId?: string | null;
  content?: string;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  deletedAt?: string;
  syncedAt?: string;
};

export type Collection = {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  deletedAt?: string;
  syncedAt?: string;
};

// export type Change = {
//   id: string; // Change record ID (primary key)
//   entityId: string; // ID of the entity being changed (matches sync_contract.go ID field)
//   type: "task" | "project" | "note" | "collection";
//   title?: string;
//   description?: string;
//   projectId?: string;
//   sortOrder?: string;
//   dueDate?: string;
//   status?: number;
//   content?: string;
//   color?: string;
//   collectionId?: string;
//   updatedAt: string;
//   createdAt: string;
//   deletedAt?: string;
// };

export type Settings = {
  name: string;
  value: string | number | boolean | object | any;
  createdAt: string;
  updatedAt: string;
};

class MemrDatabase extends Dexie {
  tasks!: Table<Task>;
  projects!: Table<Project>;
  notes!: Table<Note>;
  collections!: Table<Collection>;
  // changes!: Table<Change>;
  settings!: Table<Settings>;

  constructor() {
    super("memr");
    this.version(1).stores({
      tasks: "id, projectId, deletedAt",
      projects: "id, deletedAt",
      notes: "id, collectionId, deletedAt",
      collections: "id, deletedAt",
      // changes: "id, entityId, type, deletedAt",
      settings: "name, createdAt",
    });
    this.version(2)
      .stores({
        tasks: "id, userId, projectId, deletedAt",
        projects: "id, userId, deletedAt",
        notes: "id, userId, collectionId, deletedAt",
        collections: "id, userId, deletedAt",
        settings: "name, createdAt",
      })
      .upgrade(async (tx) => {
        // Migration: Add userId to all existing entities
        // For existing data, we'll set userId to empty string or a default
        // In practice, this should be handled by the app logic
        const defaultUserId = "";

        await tx
          .table("tasks")
          .toCollection()
          .modify((task) => {
            if (!task.userId) {
              task.userId = defaultUserId;
            }
          });

        await tx
          .table("projects")
          .toCollection()
          .modify((project) => {
            if (!project.userId) {
              project.userId = defaultUserId;
            }
          });

        await tx
          .table("notes")
          .toCollection()
          .modify((note) => {
            if (!note.userId) {
              note.userId = defaultUserId;
            }
          });

        await tx
          .table("collections")
          .toCollection()
          .modify((collection) => {
            if (!collection.userId) {
              collection.userId = defaultUserId;
            }
          });
      });
  }
}

export const db = new MemrDatabase();
