import { differenceInDays, isFuture, isToday, parseISO } from "date-fns";
import { useMemo } from "react";

import { formatDate } from "@/lib/date";
import { chatApiHook, type ChatRes } from "@/service/api-chat";

import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "../ui";

const GROUP_NAMES = {
  TODAY: "Today",
  LAST_WEEK: "Last Week",
  OLDER: "Older",
  INVALID: "",
};

type GroupedChat = {
  name: (typeof GROUP_NAMES)[keyof typeof GROUP_NAMES];
  chats: ChatRes[];
};

function groupChatsByDate(chats: ChatRes[] | undefined): GroupedChat[] {
  const now = new Date();
  const today: ChatRes[] = [];
  const lastWeek: ChatRes[] = [];
  const older: ChatRes[] = [];
  const invalid: ChatRes[] = [];

  if (!chats) {
    return [];
  }

  for (const chat of chats) {
    try {
      const updatedAt = parseISO(chat.updatedAt);

      // Check for invalid date (future dates)
      if (isFuture(updatedAt) || isNaN(updatedAt.getTime())) {
        invalid.push(chat);
        continue;
      }

      // Check if today
      if (isToday(updatedAt)) {
        today.push(chat);
        continue;
      }

      // Check if within last week (between 1 and 7 days ago)
      const daysDiff = differenceInDays(now, updatedAt);
      if (daysDiff > 0 && daysDiff <= 7) {
        lastWeek.push(chat);
        continue;
      }

      // Older than a week
      if (daysDiff > 7) {
        older.push(chat);
      }
    } catch {
      // Invalid date format
      invalid.push(chat);
    }
  }

  // Return array with groups that have chats, in order
  const grouped: GroupedChat[] = [];
  if (today.length > 0) {
    grouped.push({ name: GROUP_NAMES.TODAY, chats: today });
  }
  if (lastWeek.length > 0) {
    grouped.push({ name: GROUP_NAMES.LAST_WEEK, chats: lastWeek });
  }
  if (older.length > 0) {
    grouped.push({ name: GROUP_NAMES.OLDER, chats: older });
  }
  if (invalid.length > 0) {
    grouped.push({ name: GROUP_NAMES.INVALID, chats: invalid });
  }

  return grouped;
}

export function ChatHistory({
  onSelectChat,
  selectedChatId,
}: {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string | null;
}) {
  const { data: chatsData, isLoading: isLoadingChats } = chatApiHook.useListChats(1, 20);

  const groupedChats = useMemo(
    () => groupChatsByDate(chatsData?.data?.items),
    [chatsData?.data?.items]
  );

  return (
    <>
      <DropdownMenuLabel className="text-xs font-medium px-4 py-2">Chat History</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {isLoadingChats ? (
        <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
      ) : groupedChats.length > 0 ? (
        <DropdownMenuRadioGroup value={selectedChatId || undefined} onValueChange={onSelectChat}>
          {groupedChats.map((group, groupIndex) => (
            <div key={group.name}>
              {groupIndex > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-xs font-semibold px-4 py-2 text-muted-foreground">
                {group.name}
              </DropdownMenuLabel>
              {group.chats.map((chat) => (
                <DropdownMenuRadioItem value={chat.id} key={chat.id} className="px-4 py-2.5">
                  <div className="space-y-0.5">
                    <p className="text-sm text-foreground line-clamp-1">
                      {chat.firstMessage || "Untitled Chat"}
                    </p>
                    {group.name != GROUP_NAMES.INVALID && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(new Date(chat.updatedAt), undefined, {
                          includeTime: true,
                        })}
                      </p>
                    )}
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </div>
          ))}
        </DropdownMenuRadioGroup>
      ) : (
        <div className="px-4 py-2 text-sm text-muted-foreground">No chat history</div>
      )}
    </>
  );
}
