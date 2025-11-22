import { useParams } from "react-router-dom";

import { ProjectWorkspace } from "@/components/projects/project-workspace";

export function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <>
      <ProjectWorkspace projectId={projectId} />
    </>
  );
}
