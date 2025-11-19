"use client";

import { ArrowDownUp, Filter, ListFilter, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { ROUTES } from "@/lib/routes";
import { noteApiHook, useGetNotes } from "@/service/local/api-note";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { NoteItem } from "./note-item";

type Props = {};

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

export function NoteDashboard({}: Props) {
  const [sortBy, setSortBy] = useState<SortByValue>("updatedAt");
  const router = useRouter();
  const { data: notes, isLoading } = useGetNotes({ sortBy });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

  // add noote
  const { mutate: createNote } = noteApiHook.useCreateNote({
    onSuccess: (data) => {
      router.push(ROUTES.NOTE(data.id));
    },
  });

  const handleAddNote = () => {
    createNote({
      title: "",
      content: "",
    });
  };

  return (
    <div>
      {/* Header */}
      <Collapsible key="note-filter-collapsible">
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <h1 className="text-2xl font-semibold">Notes</h1>
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
          <div className="px-6 flex items-center pb-3">
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
