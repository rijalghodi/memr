"use client";

import { differenceInDays, isToday, isYesterday, startOfWeek } from "date-fns";
import { FileText, Search, X } from "lucide-react";
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
import { MarkdownViewer } from "../ui/ai/markdown-viewer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

const GROUP_NAMES = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  EARLIER_THIS_WEEK: "Earlier This Week",
  LAST_WEEK: "Last Week",
  OLDER: "Older",
  INVALID: "Invalid",
} as const;

type GroupedNote = {
  name: (typeof GROUP_NAMES)[keyof typeof GROUP_NAMES];
  notes: NoteRes[];
};

function getNoteGroup(updatedAt: Date, now: Date): (typeof GROUP_NAMES)[keyof typeof GROUP_NAMES] {
  if (isToday(updatedAt)) return GROUP_NAMES.TODAY;
  if (isYesterday(updatedAt)) return GROUP_NAMES.YESTERDAY;

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const daysDiff = differenceInDays(now, updatedAt);

  if (updatedAt >= weekStart && updatedAt < now && daysDiff >= 2) {
    return GROUP_NAMES.EARLIER_THIS_WEEK;
  }

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

  if (updatedAt >= lastWeekStart && updatedAt <= lastWeekEnd) {
    return GROUP_NAMES.LAST_WEEK;
  }

  if (daysDiff > 7) return GROUP_NAMES.OLDER;
  return GROUP_NAMES.INVALID;
}

function groupNotesByDate(notes: NoteRes[] | undefined): GroupedNote[] {
  if (!notes) return [];

  const now = new Date();
  const groups = new Map<string, NoteRes[]>();

  for (const note of notes) {
    try {
      const updatedAt = new Date(note.updatedAt);
      const groupName = isNaN(updatedAt.getTime())
        ? GROUP_NAMES.INVALID
        : getNoteGroup(updatedAt, now);

      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(note);
    } catch {
      if (!groups.has(GROUP_NAMES.INVALID)) {
        groups.set(GROUP_NAMES.INVALID, []);
      }
      groups.get(GROUP_NAMES.INVALID)!.push(note);
    }
  }

  const groupOrder = [
    GROUP_NAMES.TODAY,
    GROUP_NAMES.YESTERDAY,
    GROUP_NAMES.EARLIER_THIS_WEEK,
    GROUP_NAMES.LAST_WEEK,
    GROUP_NAMES.OLDER,
    GROUP_NAMES.INVALID,
  ];

  return groupOrder
    .filter((name) => groups.has(name))
    .map((name) => ({ name, notes: groups.get(name)! }));
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
    if (!searchQuery.trim()) return notes || [];
    const query = searchQuery.toLowerCase();
    return (notes || []).filter((note) => {
      const title = (note.title || NOTE_TITLE_FALLBACK).toLowerCase();
      const content = markdownToText(note.content || "", 200).toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }, [notes, searchQuery]);

  const groupedNotes = useMemo(() => groupNotesByDate(filteredNotes), [filteredNotes]);

  const hoveredNote = hoveredNoteId
    ? filteredNotes.find((note) => note.id === hoveredNoteId)
    : null;

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
        <DialogHeader>
          <DialogTitle className="sr-only">Search Anything</DialogTitle>
          <DialogDescription className="sr-only">Search Anything</DialogDescription>
          {/* Header with Search Bar */}
          <div className="relative flex items-center justify-center px-6 pt-8 pb-6 border-b border-border bg-sidebar">
            <div className="relative w-full max-w-3xl">
              <div className="relative flex items-center">
                {/* Mem Logo/Icon */}
                <Search className="size-4 text-muted-foreground absolute left-4" />
                <input
                  type="text"
                  placeholder="Search anything in Memr"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 w-full rounded-full bg-background border border-transparent focus:border-primary focus:outline-none text-muted-foreground "
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
        </DialogHeader>
        <div className="flex flex-col flex-1 min-h-0 bg-background">
          {/* Content Area */}
          <div className="flex-1 grid min-h-0 max-w-7xl mx-auto grid-cols-1 lg:grid-cols-[1fr_500px] gap-4 w-full">
            {/* Notes List */}
            <div className="min-h-0 h-full">
              <ScrollArea className="h-full">
                <div className="px-6 py-6 w-full">
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
                                    {formatDate(new Date(note.updatedAt), undefined, {
                                      includeTime: false,
                                    })}
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
            </div>

            {/* Note Preview Panel */}
            {hoveredNote && (
              <div
                className="py-6 lg:flex hidden min-h-0 h-full flex-col"
                onMouseEnter={() => setHoveredNoteId(hoveredNote.id)}
              >
                <div className="w-full flex-1 min-h-0 bg-muted rounded-lg">
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {hoveredNote.content ? (
                            <MarkdownViewer content={hoveredNote.content} />
                          ) : (
                            NOTE_CONTENT_EXCERPT_FALLBACK
                          )}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
