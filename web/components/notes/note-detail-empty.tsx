import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ROUTES } from "@/lib/routes";

import { NoteIcon } from "./note-icon";

export function NoteDetailEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <NoteIcon />
        </EmptyMedia>
        <EmptyTitle>Note not found</EmptyTitle>
        <EmptyDescription>The note you are looking for does not exist.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={ROUTES.NOTES}>Go to Notes</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
