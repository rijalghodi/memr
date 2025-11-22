import { NoteDashboard } from "@/components/notes/note-dashboard";
import { usePageTitle } from "@/hooks/use-page-title";
import { BRAND } from "@/lib/brand";

export function NotesPage() {
  usePageTitle(`Notes | ${BRAND.SITE_NAME}`);
  return (
    <>
      <NoteDashboard />
    </>
  );
}
