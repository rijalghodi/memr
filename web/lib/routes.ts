export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  GOOGLE_SUCCESS: "/google-success",
  NOTES: "/notes",
  NOTE: "/notes/:noteId",
  // NOTE: (id: string) => `/notes/${id}`,
  COLLECTIONS: "/collections",
  COLLECTION: "/collections/:collectionId",
  PROJECTS: "/projects",
  PROJECT: "/projects/:projectId",
  TASKS: "/tasks",
};

export const getRoute = (path: string, params: Record<string, string>) => {
  return path.replace(/:(\w+)/g, (match, p1) => params[p1] ?? match);
};
