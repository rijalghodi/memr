"use client";

import { ArrowUpDown, Filter, Plus, SortAsc } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { NoteItem } from "./note-item";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { DropdownFilter } from "../ui/drropdown-filter";
import { useGetNotes } from "@/service/local/api-note";

type Props = {};

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

export default function NoteDashboard({}: Props) {
  const [sortBy, setSortBy] = useState<SortByValue>("updatedAt");

  const { data: notes, isLoading } = useGetNotes(undefined, sortBy as any);

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

  return (
    <div>
      {/* Header */}
      <Collapsible key="note-filter-collapsible">
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <h1 className="text-2xl font-semibold">Notes</h1>
          <div className="flex items-center gap-0">
            <Button variant="ghost" size="icon">
              <Plus />
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                <Filter />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="px-6 flex items-center">
            <DropdownFilter
              variant="secondary"
              className="rounded-full px-4"
              value={sortBy}
              onValueChange={handleSortChange}
              icon={<ArrowUpDown />}
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
      </Collapsible>
      {/* Content */}
      <div data-slot="content" className="">
        {isLoading ? (
          <div className="px-6 py-6 text-center text-muted-foreground">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="px-6 py-20 text-center text-muted-foreground">
            No notes found
          </div>
        ) : (
          <div className="flex flex-col">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                id={note.id}
                title={note.title}
                content={note.content}
                createdAt={note.createdAt}
                updatedAt={note.updatedAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
