"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { getCssColorStyle } from "@/lib/color";
import { useGetCollections } from "@/service/local/api-collection";

import { CollectionIcon } from "../collections/collection-icon";
import { Button } from "../ui";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { NoteCollectionPickerContent } from "./note-collection-picker";

export function NoteCollectionFilter({
  value,
  onValueChange,
}: {
  value: string | undefined;
  onValueChange: (value: string | null) => void;
}) {
  const { data: collections } = useGetCollections();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const currentCollection = useMemo(() => {
    return collections?.find((c) => c.id === value);
  }, [collections, value]);

  const handleChange = useCallback(
    (newCollectionId: string | null) => {
      onValueChange(newCollectionId);
    },
    [onValueChange]
  );

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            className="rounded-full"
            size={isMobile ? "sm" : "default"}
            style={getCssColorStyle(currentCollection?.color ?? "")}
          >
            <CollectionIcon />
            {currentCollection?.title || <span className="text-muted-foreground">Collection</span>}
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <NoteCollectionPickerContent
            createOnEmpty={false}
            value={value}
            onChange={handleChange}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
