"use client";

import { Check, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { getCssColorStyle, getRandomColor } from "@/lib/color";
import { COLLECTION_TITLE_FALLBACK } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useCreateCollection, useGetCollections } from "@/service/local/api-collection";
import { noteApi } from "@/service/local/api-note";

import { CollectionIcon } from "../collections/collection-icon";
import { Button } from "../ui";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Spinner } from "../ui/spinner";

export function NoteCollectionPicker({
  noteId,
  collectionId,
}: {
  noteId: string;
  collectionId: string | undefined;
}) {
  const { data: collections } = useGetCollections();
  const [open, setOpen] = useState(false);

  const currentCollection = useMemo(() => {
    return collections?.find((c) => c.id === collectionId);
  }, [collections, collectionId]);

  const handleChange = useCallback(
    (newCollectionId: string | undefined) => {
      noteApi.update({
        id: noteId,
        collectionId: newCollectionId,
      });
    },
    [noteId]
  );

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="bg-muted text-muted-foreground"
            style={getCssColorStyle(currentCollection?.color ?? "")}
          >
            <CollectionIcon />
            {currentCollection?.title || <span className="text-muted-foreground">Organize</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <NoteCollectionPickerContent
            value={collectionId}
            onChange={handleChange}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export type NoteCollectionPickerContentProps = {
  value?: string;
  onChange?: (collectionId: string | undefined) => void;
  onClose?: () => void;
  createOnEmpty?: boolean;
};

export const NoteCollectionPickerContent = ({
  value,
  onChange: onChange,
  onClose,
  createOnEmpty = true,
}: NoteCollectionPickerContentProps) => {
  const [search, setSearch] = useState("");
  const { data: collections, isLoading } = useGetCollections();

  const handleCreateSuccess = useCallback(
    (newCollection: { id: string }) => {
      onChange?.(newCollection.id);
      onClose?.();
      setSearch("");
    },
    [onChange, onClose]
  );

  const { mutate: createCollection, isLoading: isCreating } = useCreateCollection({
    onSuccess: handleCreateSuccess,
  });

  const filteredCollections = useMemo(() => {
    if (!search.trim()) {
      return collections ?? [];
    }
    const searchLower = search.toLowerCase();
    return (
      collections?.filter((collection) =>
        (collection.title || COLLECTION_TITLE_FALLBACK).toLowerCase().includes(searchLower)
      ) ?? []
    );
  }, [collections, search]);

  const handleSelect = (collectionId: string) => {
    if (collectionId === "") {
      onChange?.(undefined);
    } else {
      const newValue = collectionId === value ? undefined : collectionId;
      onChange?.(newValue);
    }
    onClose?.();
    setSearch("");
  };

  const handleCreateCollection = () => {
    if (createOnEmpty && search.trim()) {
      createCollection({
        title: search.trim(),
        color: getRandomColor(),
      });
    }
  };

  return (
    <Command shouldFilter={false}>
      <CommandInput placeholder="Search collections..." value={search} onValueChange={setSearch} />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Spinner />
          </div>
        ) : (
          <>
            {filteredCollections.length > 0 && (
              <CommandGroup>
                {value && (
                  <CommandItem value="remove" onSelect={() => handleSelect("")}>
                    <X className="size-4" />
                    <span>Remove collection</span>
                  </CommandItem>
                )}
                {filteredCollections.map((collection) => (
                  <CommandItem
                    key={collection.id}
                    value={collection.id}
                    onSelect={() => handleSelect(collection.id)}
                  >
                    <CollectionIcon className="size-4" style={{ color: collection.color }} />
                    <span className="text-ellipsis line-clamp-1">
                      {collection.title || COLLECTION_TITLE_FALLBACK}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto size-4",
                        value === collection.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
            {createOnEmpty && (
              <CommandGroup>
                <CommandItem onSelect={handleCreateCollection} disabled={isCreating}>
                  <Plus className="size-4" />
                  <span>Create collection &quot;{search.trim()}&quot;</span>
                </CommandItem>
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </Command>
  );
};
