import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { CollectionIcon } from "./collection-icon";

type CollectionEmptyProps = {
  onAddCollection: () => void;
};

export function CollectionEmpty({ onAddCollection }: CollectionEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CollectionIcon />
        </EmptyMedia>
        <EmptyTitle>No Collections</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any collections yet.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button className="rounded-full" onClick={onAddCollection}>
            Create Collection
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
