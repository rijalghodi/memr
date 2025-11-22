import { useParams } from "react-router-dom";

import { CollectionWorkspace } from "@/components/collections/collection-workspace/collection-workspace";

export function CollectionWorkspacePage() {
  const params = useParams();
  const collectionId = params.collectionId as string;

  return (
    <>
      <CollectionWorkspace collectionId={collectionId} />
    </>
  );
}
