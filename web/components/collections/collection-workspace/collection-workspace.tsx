"use client";

import { ArrowDownUp, ListFilter, Plus } from "lucide-react";
import React, { useState } from "react";

import { useBrowserNavigate } from "@/components/browser-navigation";
import { COLLECTION_TITLE_FALLBACK } from "@/lib/constant";
import { getRoute, ROUTES } from "@/lib/routes";
import { collectionApi, useGetCollection } from "@/service/local/api-collection";
import { noteApiHook, useGetNotes } from "@/service/local/api-note";

import { NoteItem } from "../../notes/note-item";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui";
import { Button } from "../../ui/button";
import { DropdownFilter } from "../../ui/drropdown-filter";
import { CollectionIcon } from "../collection-icon";
import { NoteEmpty } from "./note-empty";

type SortByValue = "updatedAt" | "createdAt";

export function CollectionWorkspace({ collectionId }: { collectionId: string }) {
  const [sortBy, setSortBy] = useState<SortByValue | undefined>();
  const { navigate } = useBrowserNavigate();
  const { data: collection } = useGetCollection(collectionId);

  const { data: notes, isLoading: isLoadingNotes } = useGetNotes({
    sortBy,
    collectionId,
  });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

  // add note
  const { mutate: createNote } = noteApiHook.useCreateNote({
    onSuccess: (data) => {
      navigate(getRoute(ROUTES.NOTE, { noteId: data.id }));
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

  const handleTitleUpdate = (
    e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>
  ) => {
    const newTitle = e.target.value;
    collectionApi.update({
      id: collectionId,
      title: newTitle,
    });
    document.title = newTitle;
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
                className="size-5 md:size-6 shrink-0"
                style={{ color: collection?.color }}
              />
              <input
                className="text-2xl md:text-3xl font-semibold focus:outline-none focus:ring-0 p-2 focus:bg-muted rounded-md w-full max-w-[300px]"
                placeholder={COLLECTION_TITLE_FALLBACK}
                value={collection?.title || ""}
                onChange={handleTitleUpdate}
                onBlur={handleTitleUpdate}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              />
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ListFilter />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="icon"
                className="rounded-full"
                onClick={handleAddNote}
              >
                <Plus />
              </Button>
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
                placeholder="Sort by"
                options={[
                  {
                    label: "Last Modified",
                    value: "updatedAt",
                  },
                  {
                    label: "Last Created",
                    value: "createdAt",
                  },
                ]}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Content */}
      <div
        data-slot="content"
        className="pb-6 animate-in fade-in slide-in-from-bottom-3 duration-500"
      >
        {isLoadingNotes ? null : notes.length === 0 ? (
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
