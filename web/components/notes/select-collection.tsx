"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

import { COLLECTION_TITLE_FALLBACK } from "@/lib/constant";
import { useGetCollections } from "@/service/local/api-collection";
import { noteApi } from "@/service/local/api-note";

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

export function SelectCollection({
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
