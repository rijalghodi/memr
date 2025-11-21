"use client";

import { ArrowDownUp, ListFilter, Plus } from "lucide-react";
import React, { useMemo, useState } from "react";

import { useBrowserNavigate } from "@/components/browser-navigation";
import { COLLECTION_TITLE_FALLBACK, NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { getRoute, ROUTES } from "@/lib/routes";
import {
  collectionApi,
  useGetCollection,
} from "@/service/local/api-collection";
import { noteApiHook, useGetNotes } from "@/service/local/api-note";

import { NoteItem } from "../../notes/note-item";
import { NoteLoading } from "../../notes/note-loading";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui";
import { Button } from "../../ui/button";
import { DropdownFilter } from "../../ui/drropdown-filter";
import { CollectionIcon } from "../collection-icon";
import { NoteEmpty } from "./note-empty";

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

export function CollectionWorkspace({
  collectionId,
}: {
  collectionId: string;
}) {
  const [sortBy, setSortBy] = useState<SortByValue | undefined>();
  const { navigate } = useBrowserNavigate();
  const { data: collection } = useGetCollection(collectionId);

  const collectionTitle = useMemo(() => collection?.title || "", [collection]);

  const { data: notes, isLoading: isLoadingNotes } = useGetNotes({
    sortBy,
    collectionId,
  });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

  // add noote
  const { mutate: createNote } = noteApiHook.useCreateNote({
    onSuccess: (data) => {
      navigate(getRoute(ROUTES.NOTE, { noteId: data.id }), NOTE_TITLE_FALLBACK);
    },
  });

  const handleAddNote = () => {
    createNote({
      collectionId,
      content: "",
    });
  };

  const handleResetFilters = () => {
    setSortBy(undefined);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    collectionApi.update({
      id: collectionId,
      title: e.target.value,
    });
  };

  const handleTitleBlur = () => {
    collectionApi.update({
      id: collectionId,
      title: collectionTitle,
    });
  };

  const isFiltered = sortBy !== undefined;

  return (
    <div className="pt-4 space-y-4">
      {/* Header */}
      <Collapsible key="note-filter-collapsible">
        <div className="px-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollectionIcon
                className="size-6"
                style={{ color: collection?.color }}
              />
              <input
                className="text-3xl font-semibold focus:outline-none focus:ring-0 p-2 focus:bg-muted rounded-md"
                placeholder={COLLECTION_TITLE_FALLBACK}
                value={collectionTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-0">
              <Button variant="ghost" size="icon" onClick={handleAddNote}>
                <Plus />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ListFilter />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="flex items-center">
              <DropdownFilter
                variant="secondary"
                className="rounded-full px-4"
                value={sortBy}
                onValueChange={handleSortChange}
                icon={<ArrowDownUp />}
                options={[
                  {
                    label: "Last Updated",
                    value: "updatedAt",
                  },
                  {
                    label: "Last Viewed",
                    value: "viewedAt",
                  },
                  {
                    label: "Created",
                    value: "createdAt",
                  },
                ]}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Content */}
      <div data-slot="content" className="pb-6">
        {isLoadingNotes ? (
          <NoteLoading />
        ) : notes.length === 0 ? (
          <NoteEmpty
            isFiltered={isFiltered}
            onAddNote={handleAddNote}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <div className="flex flex-col">
            {notes.map((note) => (
              <NoteItem key={note.id} {...note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
