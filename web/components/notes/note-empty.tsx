import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { NoteIcon } from "./note-icon";

type NoteEmptyProps = {
  onAddNote: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
};

export function NoteEmpty({ onAddNote, onResetFilters, isFiltered }: NoteEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <NoteIcon />
        </EmptyMedia>
        <EmptyTitle>{isFiltered ? "No Notes Found" : "No Notes"}</EmptyTitle>
        <EmptyDescription>
          {isFiltered
            ? "No notes found matching your filters."
            : "You haven't created any notes yet."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={onAddNote} className="rounded-full">
            Create Note
          </Button>
          {isFiltered && (
            <Button variant="outline" onClick={onResetFilters} className="rounded-full">
              Reset Filters
            </Button>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );
}
