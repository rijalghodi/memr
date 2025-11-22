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

export const extractRoute = (
  path: string,
): { path: string; params: Record<string, string> } => {
  // Check exact matches first
  const exactMatch = Object.values(ROUTES).find((route) => route === path);
  if (exactMatch) {
    return { path: exactMatch, params: {} };
  }

  // Check parameterized routes
  const routePatterns = Object.values(ROUTES);

  for (const routePattern of routePatterns) {
    // Convert route pattern to regex
    const regexPattern = routePattern.replace(/:(\w+)/g, "([^/]+)");
    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (match) {
      // Extract parameter names from route pattern
      const paramNames = routePattern.match(/:(\w+)/g) || [];
      const params: Record<string, string> = {};

      // Extract parameter values from the matched path
      paramNames.forEach((param, index) => {
        const paramName = param.slice(1); // Remove the ':' prefix
        params[paramName] = match[index + 1]; // match[0] is the full match
      });

      return { path: routePattern, params };
    }
  }

  // If no match found, return the original path with empty params
  return { path, params: {} };
};
