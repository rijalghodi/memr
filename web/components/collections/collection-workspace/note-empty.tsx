import { NoteIcon } from "@/components/notes/note-icon";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type NoteEmptyProps = {
  onAddNote: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
};

export function NoteEmpty({
  onAddNote,
  onResetFilters,
  isFiltered,
}: NoteEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <NoteIcon className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>
          {isFiltered ? "No Notes Found" : "No Notes Yet"}
        </EmptyTitle>
        <EmptyDescription>
          {isFiltered
            ? "No notes found matching your filters."
            : "This collection doesn't have any notes yet."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button className="rounded-full" onClick={onAddNote}>
            Create Note
          </Button>
          {isFiltered && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={onResetFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );
}
