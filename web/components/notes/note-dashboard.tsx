"use client";

import { ArrowDownUp, ListFilter, Loader, Plus } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { ROUTES } from "@/lib/routes";
import { noteApiHook, useGetNotes } from "@/service/local/api-note";

import { useSessionTabs } from "../session-tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { NoteItem } from "./note-item";

type Props = {};

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

export function NoteDashboard({}: Props) {
  const [sortBy, setSortBy] = useState<SortByValue>("updatedAt");
  const navigate = useNavigate();
  const { data: notes, isLoading } = useGetNotes({ sortBy });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

  // add noote
  const { addTab } = useSessionTabs();
  const { mutate: createNote } = noteApiHook.useCreateNote({
    onSuccess: (data) => {
      navigate(ROUTES.NOTE(data.id));
      addTab({
        title: NOTE_TITLE_FALLBACK,
        pathname: ROUTES.NOTE(data.id),
      });
    },
  });

  const handleAddNote = () => {
    createNote({
      content: "",
    });
  };

  return (
    <div>
      {/* Header */}
      <Collapsible key="note-filter-collapsible">
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
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
      <div data-slot="content" className="pb-6">
        {isLoading ? (
          <div className="p-6 h-[300px] text-center flex flex-col gap-4 items-center justify-center">
            <Loader className="size-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Loading notes...
            </span>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-6 h-[300px] text-center text-muted-foreground">
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
