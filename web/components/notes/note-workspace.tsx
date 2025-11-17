"use client";

import React, { useEffect, useRef, useState } from "react";
import { RichTextEditor } from "../ui/rich-text/rich-text-editor";
import { useGetNote, useUpdateNote } from "@/service/local/api-note";
import { useForm } from "react-hook-form";
import { debounce } from "@/lib/utils";

type Props = {
  noteId?: string;
};

const DEBOUNCE_TIME = 5000;

export function NoteWorkspace({ noteId }: Props) {
  const { data: note, isLoading } = useGetNote(noteId);
  const { mutate: updateNote } = useUpdateNote({});

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
      });
    }
  }, [note]);

  const debouncedUpdate = useRef(
    debounce((values: { id: string; title: string; content: string }) => {
      updateNote(values);
    }, DEBOUNCE_TIME)
  ).current;

  useEffect(() => {
    if (!noteId) return;
    const subscription = form.watch((values) => {
      // Whenever title or content changes, trigger debounced update.
      if (form.formState.isDirty) {
        debouncedUpdate({
          id: noteId,
          title: values.title ?? "",
          content: values.content ?? "",
        });
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  if (isLoading && noteId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto">
      <div className="pt-6 pb-0 w-full px-[120px]">
        <input
          type="text"
          placeholder="Untitled"
          {...form.register("title")}
          className="w-fit tex-2xl p-2 md:text-3xl lg:text-5xl font-bold focus:outline-none border-none focus:ring-0 focus:bg-accent rounded-lg"
        />
      </div>
      <div className="w-full">
        <RichTextEditor
          value={form.watch("content")}
          onChange={(value) => form.setValue("content", value)}
        />
      </div>
    </div>
  );
}
