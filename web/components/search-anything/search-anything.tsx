"use client";

import { differenceInDays, isFuture, isYesterday, parseISO, startOfWeek } from "date-fns";
import { FileText, X } from "lucide-react";
import { useMemo, useState } from "react";

import { getCssColorStyle } from "@/lib/color";
import { NOTE_CONTENT_EXCERPT_FALLBACK, NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { formatDate } from "@/lib/date";
import { getRoute, ROUTES } from "@/lib/routes";
import { markdownToText } from "@/lib/string";
import { cn } from "@/lib/utils";
import { useGetCollections } from "@/service/local/api-collection";
import { type NoteRes, useGetNotes } from "@/service/local/api-note";

import { useBrowserNavigate } from "../browser-navigation";
import { CollectionIcon } from "../collections/collection-icon";
import { Dialog, DialogClose, DialogContent } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

const GROUP_NAMES = {
  YESTERDAY: "YESTERDAY",
  EARLIER_THIS_WEEK: "EARLIER THIS WEEK",
  LAST_WEEK: "LAST WEEK",
  OLDER: "OLDER",
} as const;

type GroupedNote = {
  name: (typeof GROUP_NAMES)[keyof typeof GROUP_NAMES];
  notes: NoteRes[];
};

function groupNotesByDate(notes: NoteRes[] | undefined): GroupedNote[] {
  const now = new Date();
  const yesterday: NoteRes[] = [];
  const earlierThisWeek: NoteRes[] = [];
  const lastWeek: NoteRes[] = [];
  const older: NoteRes[] = [];

  if (!notes) {
    return [];
  }

  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

  for (const note of notes) {
    try {
      const updatedAt = parseISO(note.updatedAt);

      // Check for invalid date (future dates)
      if (isFuture(updatedAt) || isNaN(updatedAt.getTime())) {
        continue;
      }

      // Check if yesterday
      if (isYesterday(updatedAt)) {
        yesterday.push(note);
        continue;
      }

      const daysDiff = differenceInDays(now, updatedAt);

      // Check if earlier this week (from start of week to day before yesterday)
      if (updatedAt >= weekStart && updatedAt < now && daysDiff >= 2) {
        earlierThisWeek.push(note);
        continue;
      }

      // Check if last week (between last week start and end)
      if (updatedAt >= lastWeekStart && updatedAt <= lastWeekEnd) {
        lastWeek.push(note);
        continue;
      }

      // Older than last week
      if (daysDiff > 7) {
        older.push(note);
      }
    } catch {
      // Invalid date format, skip
      continue;
    }
  }

  // Return array with groups that have notes, in order
  const grouped: GroupedNote[] = [];
  if (yesterday.length > 0) {
    grouped.push({ name: GROUP_NAMES.YESTERDAY, notes: yesterday });
  }
  if (earlierThisWeek.length > 0) {
    grouped.push({ name: GROUP_NAMES.EARLIER_THIS_WEEK, notes: earlierThisWeek });
  }
  if (lastWeek.length > 0) {
    grouped.push({ name: GROUP_NAMES.LAST_WEEK, notes: lastWeek });
  }
  if (older.length > 0) {
    grouped.push({ name: GROUP_NAMES.OLDER, notes: older });
  }

  return grouped;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchAnything({ open, onOpenChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const { data: notes, isLoading } = useGetNotes({ sortBy: "updatedAt" });
  const { data: collections } = useGetCollections();
  const { navigate } = useBrowserNavigate();

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }
    const query = searchQuery.toLowerCase();
    return notes.filter((note) => {
      const title = (note.title || NOTE_TITLE_FALLBACK).toLowerCase();
      const content = markdownToText(note.content || "", 200).toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }, [notes, searchQuery]);

  const groupedNotes = useMemo(() => groupNotesByDate(filteredNotes), [filteredNotes]);

  const hoveredNote = useMemo(() => {
    if (!hoveredNoteId) return null;
    return filteredNotes.find((note) => note.id === hoveredNoteId);
  }, [filteredNotes, hoveredNoteId]);

  const hoveredNoteCollection = useMemo(() => {
    if (!hoveredNote?.collectionId) return null;
    return collections?.find((c) => c.id === hoveredNote.collectionId);
  }, [collections, hoveredNote]);

  const handleNoteClick = (noteId: string) => {
    navigate(getRoute(ROUTES.NOTE, { noteId }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-screen sm:max-w-screen w-screen h-full max-h-full rounded-none p-0 gap-0 flex flex-col"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header with Search Bar */}
          <div className="relative flex items-center justify-center px-6 pt-8 pb-6 border-b border-border bg-sidebar">
            <div className="relative w-full max-w-3xl">
              <div className="relative flex items-center">
                {/* Mem Logo/Icon */}
                <div className="absolute left-4 z-10 flex items-center justify-center">
                  <img src="/logo.png" alt="logo" width={24} height={24} />
                </div>
                <input
                  type="text"
                  placeholder="Search anything in Memr"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-13 h-12 w-full rounded-full bg-background border border-transparent focus:border-primary focus:outline-none text-muted-foreground "
                  autoFocus
                />
              </div>
            </div>
            {/* Close Button */}
            <DialogClose
              className="absolute top-6 right-6 p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="size-5" />
            </DialogClose>
          </div>

          {/* Content Area */}
          <div className="flex-1 grid min-h-0 max-w-7xl mx-auto grid-cols-1 lg:grid-cols-[1fr_1fr] gap-0">
            {/* Notes List */}
            <ScrollArea className="flex-1 min-w-0">
              <div className="px-6 py-6">
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-12">Loading...</div>
                ) : groupedNotes.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    {searchQuery ? "No notes found" : "No notes"}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {groupedNotes.map((group) => (
                      <div key={group.name} className="space-y-3">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group.name}
                        </h2>
                        <div className="space-y-1">
                          {group.notes.map((note) => {
                            const displayTitle = note.title || NOTE_TITLE_FALLBACK;
                            const displayContent = note.content
                              ? markdownToText(note.content, 200)
                              : NOTE_CONTENT_EXCERPT_FALLBACK;
                            const noteCollection = collections?.find(
                              (c) => c.id === note.collectionId
                            );
                            const isHovered = hoveredNoteId === note.id;

                            return (
                              <div
                                key={note.id}
                                className={cn(
                                  "px-4 py-3 rounded-lg cursor-pointer transition-colors flex items-start gap-3",
                                  isHovered ? "bg-muted" : "hover:bg-muted/50"
                                )}
                                onMouseEnter={() => setHoveredNoteId(note.id)}
                                onClick={() => handleNoteClick(note.id)}
                              >
                                <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-medium line-clamp-1">
                                      {displayTitle}
                                    </h3>
                                    {noteCollection && (
                                      <div
                                        className="text-xs px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1 shrink-0"
                                        style={getCssColorStyle(noteCollection?.color ?? "")}
                                      >
                                        <CollectionIcon className="size-3" />
                                        {noteCollection?.title}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {displayContent}
                                  </p>
                                </div>
                                <div className="text-xs text-muted-foreground shrink-0 ml-2">
                                  {formatDate(new Date(note.updatedAt), "EEE M/dd")}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Note Preview Panel */}
            {hoveredNote && (
              <div className="py-6" onMouseEnter={() => setHoveredNoteId(hoveredNote.id)}>
                <div className="w-full bg-muted p-6 overflow-y-auto rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold">
                          {hoveredNote.title || NOTE_TITLE_FALLBACK}
                        </h2>
                        {hoveredNoteCollection && (
                          <div
                            className="text-xs px-2 py-1 rounded-sm inline-flex items-center gap-1"
                            style={getCssColorStyle(hoveredNoteCollection?.color ?? "")}
                          >
                            <CollectionIcon className="size-3" />
                            {hoveredNoteCollection?.title}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(new Date(hoveredNote.updatedAt), "EEE M/dd")}
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {hoveredNote.content
                          ? markdownToText(hoveredNote.content, 1000)
                          : NOTE_CONTENT_EXCERPT_FALLBACK}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
