export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  NOTES: "/notes",
  NOTE: (id: string) => `/notes/${id}`,
  COLLECTIONS: "/collections",
  COLLECTION: (id: string) => `/collections/${id}`,
  PROJECTS: "/projects",
  PROJECT: (id: string) => `/projects/${id}`,
  TASKS: "/tasks",
  TASK: (id: string) => `/tasks/${id}`,
};
