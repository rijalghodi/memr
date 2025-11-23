import { parseISO } from "date-fns";
import { History, Plus } from "lucide-react";
import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/ai/conversation";
import { Message, MessageContent } from "@/components/ui/ai/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ui/ai/prompt-input";
import { Button } from "@/components/ui/button";
import { chatApi, chatApiHook } from "@/service/api-chat";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui";
import { Spinner } from "../ui/spinner";
import { ChatHistory } from "./chat-history";

type ChatMessage = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  reasoning?: string;
  sources?: Array<{ title: string; url: string }>;
  isStreaming?: boolean;
};

export const ChatWidget = () => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // API hooks
  const { mutate: startChat, isPending: isCreatingChat } =
    chatApiHook.useStartChat({
      onSuccess: (data) => {
        if (data.data?.chatId) {
          setCurrentChatId(data.data.chatId);
          setMessages([]);
        }
      },
      onError: (error) => {
        console.error("Failed to create chat:", error);
      },
    });

  const { data: historyData, isLoading: isLoadingHistory } =
    chatApiHook.useGetChatHistory(currentChatId);

  // Track if we've loaded history for current chat
  const loadedChatIdRef = useRef<string | null>(null);
  const lastHistoryMessagesRef = useRef<ChatMessage[]>([]);

  // Transform message history from API to component format
  const historyMessages = useMemo(() => {
    if (!historyData?.data?.messages || !currentChatId) {
      return [];
    }
    return historyData.data.messages.map((msg) => ({
      id: msg.id,
      content: msg.content || "",
      role: msg.role as "user" | "assistant",
      timestamp: parseISO(msg.createdAt),
      isStreaming: false,
    }));
  }, [historyData, currentChatId]);

  // Load history messages only when chatId changes and history is loaded
  // This is a valid use case: syncing external API data to component state
  // We need local state to merge with optimistic updates from streaming
  useEffect(() => {
    if (!currentChatId) {
      if (loadedChatIdRef.current !== null) {
        loadedChatIdRef.current = null;
        lastHistoryMessagesRef.current = [];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages([]);
      }
      return;
    }

    // Only load history if chatId changed and we have history data
    if (
      currentChatId !== loadedChatIdRef.current &&
      historyMessages.length > 0
    ) {
      setMessages(historyMessages);
      lastHistoryMessagesRef.current = historyMessages;
      loadedChatIdRef.current = currentChatId;
    }
  }, [currentChatId, historyMessages]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();

      if (!inputValue.trim() || isTyping || !currentChatId) return;

      const messageContent = inputValue.trim();

      // Optimistic update: Add user message immediately
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: messageContent,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      // Create placeholder assistant message
      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Start streaming
      chatApi.sendMessageStream(
        currentChatId,
        messageContent,
        (chunk) => {
          // Update assistant message with streamed content
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  content: msg.content + chunk.content,
                  isStreaming: !chunk.done,
                };
              }
              return msg;
            }),
          );

          if (chunk.done) {
            setIsTyping(false);
          }
        },
        (error) => {
          console.error("Streaming error:", error);
          setIsTyping(false);
          // Update message with error or remove it
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  content: msg.content || "Error: Failed to get response",
                  isStreaming: false,
                };
              }
              return msg;
            }),
          );
        },
        () => {
          setIsTyping(false);
        },
      );
    },
    [inputValue, isTyping, currentChatId],
  );

  const handleNewChat = useCallback(() => {
    startChat();
  }, [startChat]);

  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Chat</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            disabled={isCreatingChat}
          >
            <Plus />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <History />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              className="w-[240px] rounded-xl"
            >
              <ChatHistory
                onSelectChat={handleSelectChat}
                selectedChatId={currentChatId}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conversation Area */}
      <Conversation className="flex-1">
        <ConversationContent className="space-y-0 h-full">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size={20} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full flex-1 text-muted-foreground">
              {currentChatId
                ? "Start a conversation..."
                : "Create a new chat to get started"}
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-3">
                <Message from={message.role}>
                  <MessageContent>
                    {message.isStreaming && message.content === "" ? (
                      <div className="flex items-center gap-2">
                        <Spinner size={14} />
                        <span className="text-muted-foreground text-sm">
                          Thinking...
                        </span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </MessageContent>
                </Message>
              </div>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div className="border-t p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Memr anything..."
            disabled={isTyping || !currentChatId}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              {/* <PromptInputButton disabled={isTyping}>
                <PaperclipIcon size={16} />
              </PromptInputButton>
              <PromptInputButton disabled={isTyping}>
                <MicIcon size={16} />
                <span>Voice</span>
              </PromptInputButton>
              <PromptInputModelSelect
                value={selectedModel}
                onValueChange={setSelectedModel}
                disabled={isTyping}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect> */}
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!inputValue.trim() || isTyping}
              status={isTyping ? "streaming" : "ready"}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
