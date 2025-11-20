import Dexie, { type Table } from "dexie";

export type Task = {
  id: string;
  projectId?: string;
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
  collectionId?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  deletedAt?: string;
  syncedAt?: string;
};

export type Collection = {
  id: string;
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
  value: string | number | boolean | object;
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
  }
}

export const db = new MemrDatabase();
