"use client";

import { Check, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useSessionTabs } from "@/components/session-tabs";
import { RichTextEditor } from "@/components/tiptap/rich-text-editor";
import { useDebounce } from "@/hooks/use-debounce";
import {
  AUTOSAVE_INTERVAL,
  COLLECTION_TITLE_FALLBACK,
  NOTE_TITLE_FALLBACK,
} from "@/lib/constant";
import { getRoute, ROUTES } from "@/lib/routes";
import { extractFirstLineFromContent } from "@/lib/string";
import { useGetCollections } from "@/service/local/api-collection";
import { noteApi, useGetNote } from "@/service/local/api-note";

import { CollectionIcon } from "../collections/collection-icon";
import { Button } from "../ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { NoteDetailEmpty } from "./note-detail-empty";

type Props = {
  noteId: string;
};

export function NoteWorkspace({ noteId }: Props) {
  const { data: note, isLoading } = useGetNote(noteId);
  const { updateTabTitle } = useSessionTabs();

  const [content, setContent] = useState("");
  const loadedNoteIdRef = useRef<string | undefined>(undefined);
  const debouncedContent = useDebounce(content, AUTOSAVE_INTERVAL);

  // Reset content immediately when noteId changes
  useEffect(() => {
    if (noteId !== loadedNoteIdRef.current) {
      setContent("");
      loadedNoteIdRef.current = undefined;
    }
  }, [noteId]);

  // Load note content when it's available and matches current noteId
  useEffect(() => {
    if (
      !isLoading &&
      note &&
      noteId &&
      loadedNoteIdRef.current !== noteId &&
      noteId === note.id
    ) {
      setContent(note.content || "");
      loadedNoteIdRef.current = noteId;
    }
  }, [note, noteId, isLoading]);

  // Autosave debounced content (only for the currently loaded note)
  useEffect(() => {
    if (
      loadedNoteIdRef.current === noteId &&
      debouncedContent !== undefined &&
      debouncedContent !== note?.content
    ) {
      noteApi
        .update({
          id: noteId,
          content: debouncedContent,
        })
        .then(() => {
          const displayTitle =
            extractFirstLineFromContent(debouncedContent, 30) ||
            NOTE_TITLE_FALLBACK;
          updateTabTitle(getRoute(ROUTES.NOTE, { noteId }), displayTitle);
        });
    }
  }, [debouncedContent, updateTabTitle, noteId, note?.content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return <NoteDetailEmpty />;
  }

  return (
    <div className="space-y-3 pt-3 max-h-[calc(100vh-100px)] overflow-y-auto">
      <div className="px-6">
        <CollectionSelect noteId={noteId} collectionId={note.collectionId} />
      </div>
      <div
        className="w-full transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-3"
        key={noteId}
      >
        <RichTextEditor value={content} onChange={setContent} />
      </div>
    </div>
  );
}

function CollectionSelect({
  noteId,
  collectionId,
}: {
  noteId: string;
  collectionId: string | undefined;
}) {
  const { data: collections } = useGetCollections();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentCollection = collections?.find((c) => c.id === collectionId);

  const handleSelect = (collectionId: string | null) => {
    noteApi.update({
      id: noteId,
      collectionId: collectionId || undefined,
    });
    setOpen(false);
    setSearch("");
  };

  const filteredCollections = collections?.filter((collection) => {
    if (!search) return true;
    const title = collection.title || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="bg-muted text-muted-foreground"
            style={{
              color: currentCollection?.color,
              backgroundColor: currentCollection?.color
                ? `${currentCollection.color}15`
                : undefined, // 33 = 20% opacity in hex
            }}
          >
            <CollectionIcon />
            {currentCollection?.title || (
              <span className="text-muted-foreground">Organize</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search collections..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No collections found.</CommandEmpty>
              <CommandGroup>
                {collectionId && (
                  <CommandItem
                    key="no-collection"
                    id=""
                    onSelect={() => handleSelect(null)}
                    className="cursor-pointer"
                  >
                    <X className="size-4" />
                    <span>Remove</span>
                  </CommandItem>
                )}
                {filteredCollections?.map((collection) => (
                  <CommandItem
                    key={collection.id}
                    id={collection.id}
                    onSelect={() => handleSelect(collection.id)}
                    className="cursor-pointer"
                  >
                    <CollectionIcon
                      className="size-4"
                      style={{ color: collection.color }}
                    />
                    <span className="flex-1">
                      {collection.title || COLLECTION_TITLE_FALLBACK}
                    </span>
                    {collection.id === collectionId && (
                      <Check className="size-4 text-primary" strokeWidth={2} />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
