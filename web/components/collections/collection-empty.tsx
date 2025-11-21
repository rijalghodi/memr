import { Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type CollectionEmptyProps = {
  onAddCollection: () => void;
};

export function CollectionEmpty({ onAddCollection }: CollectionEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Hash />
        </EmptyMedia>
        <EmptyTitle>No Collections Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any collections yet
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button className="rounded-full">Create Collection</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
