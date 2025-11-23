import type { UIMessage } from "ai";
import type { ComponentProps, HTMLAttributes } from "react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full gap-2 py-4",
      "data-[role=user]:justify-end data-[role=assistant]:justify-start",
      className,
    )}
    data-role={from}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 overflow-hidden rounded-xl px-4 py-3 text-foreground text-sm",
        'group-data-[role="user"]:bg-accent group-data-[role="user"]:text-foreground group-data-[role="user"]:rounded-br-none group-data-[role="user"]:max-w-[80%]',
        'group-data-[role="assistant"]:px-1 group-data-[role="assistant"]:py-1 group-data-[role="assistant"]:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn("size-8 ring ring-border", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
