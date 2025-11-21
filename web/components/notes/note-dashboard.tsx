"use client";

import { ArrowDownUp, ListFilter, Plus } from "lucide-react";
import React, { useState } from "react";

import { NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { getRoute, ROUTES } from "@/lib/routes";
import { noteApiHook, useGetNotes } from "@/service/local/api-note";

import { useBrowserNavigate } from "../browser-navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { NoteEmpty } from "./note-empty";
import { NoteItem } from "./note-item";
import { NoteLoading } from "./note-loading";

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

export function NoteDashboard() {
  const [sortBy, setSortBy] = useState<SortByValue | undefined>();
  const { navigate } = useBrowserNavigate();
  const { data: notes, isLoading } = useGetNotes({ sortBy });

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
      content: "",
    });
  };

  const handleResetFilters = () => {
    setSortBy(undefined);
  };

  const isFiltered = sortBy !== undefined;

  return (
    <div className="pt-6 space-y-4">
      {/* Header */}
      <Collapsible key="note-filter-collapsible">
        <div className="px-6 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Notes</h1>
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
        {isLoading ? (
          <NoteLoading />
        ) : notes.length === 0 ? (
          <NoteEmpty
            onAddNote={handleAddNote}
            onResetFilters={handleResetFilters}
            isFiltered={isFiltered}
          />
        ) : (
          <ul className="flex flex-col">
            {notes.map((note) => (
              <NoteItem key={note.id} {...note} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
