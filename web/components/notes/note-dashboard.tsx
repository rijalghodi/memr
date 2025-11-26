"use client";

import { ArrowDownUp, ListFilter, Plus } from "lucide-react";
import React, { useState } from "react";

import { getRoute, ROUTES } from "@/lib/routes";
import { noteApi, useGetNotes } from "@/service/local/api-note";

import { useBrowserNavigate } from "../browser-navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { ScrollArea } from "../ui/scroll-area";
import { NoteCollectionFilter } from "./note-collection-filter";
import { NoteEmpty } from "./note-empty";
import { NoteItem } from "./note-item";

type SortByValue = "updatedAt" | "createdAt";

export function NoteDashboard() {
  const [sortBy, setSortBy] = useState<SortByValue | undefined>();
  const [collectionId, setCollectionId] = useState<string | undefined>();
  const { navigate } = useBrowserNavigate();
  const { data: notes, isLoading } = useGetNotes({ sortBy, collectionId });

  const handleSortChange = React.useCallback((value: string) => {
    setSortBy(value as SortByValue);
  }, []);

  const handleAddNote = React.useCallback(async () => {
    const result = await noteApi.create({
      collectionId: undefined,
      content: "",
    });
    navigate(getRoute(ROUTES.NOTE, { noteId: result.id }));
  }, [navigate]);

  const handleResetFilters = React.useCallback(() => {
    setSortBy(undefined);
  }, []);

  const isFiltered = sortBy !== undefined;

  return (
    <div className="pt-6 space-y-4 h-full flex flex-col">
      {/* Header */}
      <Collapsible key="note-filter-collapsible">
        <div className="px-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold">Notes</h1>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ListFilter />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                className="rounded-full"
                size="icon"
                onClick={handleAddNote}
              >
                <Plus />
              </Button>
            </div>
          </div>
          <CollapsibleContent>
            <div className="flex items-center gap-3">
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
              <NoteCollectionFilter value={collectionId} onValueChange={setCollectionId} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Content */}
      <ScrollArea className="pb-6 flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-3 duration-500">
        {isLoading ? null : notes.length === 0 ? (
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
      </ScrollArea>
    </div>
  );
}
