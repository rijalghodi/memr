export type TKanbanTask = {
  id: string;
  groupId: string;
  title?: string;
  description?: string;
  status?: number;
  sortOrder?: string;
  dueDate?: string;
};
