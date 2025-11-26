import "./globals.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layouts/app-layout";
import { Providers } from "@/components/providers";
import { ROUTES } from "@/lib/routes";
import { CollectionsDashboardPage } from "@/pages/collections";
import { CollectionWorkspacePage } from "@/pages/collections_collectionId";
import { GoogleSuccessPage } from "@/pages/google-success";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { NotesPage } from "@/pages/notes";
import { NoteEditorPage } from "@/pages/notes_noteId";
import { ProjectsDashboardPage } from "@/pages/projects";
import { ProjectWorkspacePage } from "@/pages/projects_projectId";
import { TasksPage } from "@/pages/tasks";

import { AuthGuard } from "./components/layouts/auth-guard";

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <div className="font-inter antialiased">
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthGuard mustNotAuthenticated />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.GOOGLE_SUCCESS} element={<GoogleSuccessPage />} />
            </Route>

            {/* App routes with layout */}
            <Route element={<AppLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.NOTES} element={<NotesPage />} />
              <Route path={ROUTES.NOTE} element={<NoteEditorPage />} />
              <Route path={ROUTES.COLLECTIONS} element={<CollectionsDashboardPage />} />
              <Route path={ROUTES.COLLECTION} element={<CollectionWorkspacePage />} />
              <Route path={ROUTES.PROJECTS} element={<ProjectsDashboardPage />} />
              <Route path={ROUTES.PROJECT} element={<ProjectWorkspacePage />} />
              <Route path={ROUTES.TASKS} element={<TasksPage />} />
            </Route>
          </Routes>
        </div>
      </Providers>
    </BrowserRouter>
  );
}

export default App;
