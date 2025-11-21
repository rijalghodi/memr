import "./globals.css";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import "./milkdown-override.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layouts/app-layout";
import { Providers } from "@/components/providers";
import { ROUTES } from "@/lib/routes";
import { GoogleSuccessPage } from "@/pages/google-success";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { NoteEditorPage } from "@/pages/note-editor";
import { NotesPage } from "@/pages/notes";
import { TasksPage } from "@/pages/tasks";

import { CollectionNoteDashboard } from "./components/collections/collection-note-dashboard";
import { AuthGuard } from "./components/layouts/auth-guard";
import { CollectionsPage } from "./pages/collections";

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <div className="font-inter antialiased">
          <Routes>
            {/* Auth routes */}
            <Route
              path={ROUTES.LOGIN}
              element={
                <AuthGuard mustNotAuthenticated>
                  <LoginPage />
                </AuthGuard>
              }
            />
            <Route
              path={ROUTES.GOOGLE_SUCCESS}
              element={<GoogleSuccessPage />}
            />

            {/* App routes with layout */}
            <Route element={<AppLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.NOTES} element={<NotesPage />} />
              <Route path={ROUTES.NOTE} element={<NoteEditorPage />} />
              <Route path={ROUTES.COLLECTIONS} element={<CollectionsPage />} />
              <Route
                path={ROUTES.COLLECTION}
                element={<CollectionNoteDashboard />}
              />
              <Route path={ROUTES.TASKS} element={<TasksPage />} />
            </Route>
          </Routes>
        </div>
      </Providers>
    </BrowserRouter>
  );
}

export default App;
