import { parseISO } from "date-fns";
import { History, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { MarkdownViewer } from "../ui/ai/markdown-viewer";
import { Spinner } from "../ui/spinner";
import { ChatHistory } from "./chat-history";

const INITIAL_MESSAGES = [
  "What notes I wrote this week?",
  "Give me a summary of my week",
  "What are my tasks for today?",
];

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
  const { isPending: isCreatingChat } = chatApiHook.useStartChat({
    onSuccess: (data) => {
      if (data.data?.id) {
        setCurrentChatId(data.data.id);
        // Don't clear messages here - let handleSendMessage manage the state
      }
    },
    onError: (error) => {
      console.error("Failed to create chat:", error);
    },
  });

  const { data: historyData, isLoading: isLoadingHistory } =
    chatApiHook.useGetChatHistory(currentChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Track if we've loaded history for current chat
  const loadedChatIdRef = useRef<string | null>(null);
  const lastHistoryMessagesRef = useRef<ChatMessage[]>([]);
  // Track if we're currently sending a message to prevent history from overwriting
  const isSendingMessageRef = useRef<boolean>(false);

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

    // Don't overwrite messages if we're currently sending a message
    if (isSendingMessageRef.current) {
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

  const handleSendMessage = useCallback(
    async (message: string) => {
      // Ensure we have a chatId before proceeding
      let chatId = currentChatId;
      if (!chatId) {
        const data = await chatApi.startChat();
        if (data.data?.id) {
          chatId = data.data.id;
          setCurrentChatId(chatId);
          // Mark this chat as loaded to prevent history from overwriting optimistic messages
          loadedChatIdRef.current = chatId;
        } else {
          // Failed to create chat, abort
          return;
        }
      }

      if (!chatId) return;

      const messageContent = message.trim();

      // Mark that we're sending a message to prevent history from overwriting
      isSendingMessageRef.current = true;

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
        chatId,
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
            })
          );

          if (chunk.done) {
            setIsTyping(false);
            isSendingMessageRef.current = false;
          }
        },
        (error) => {
          console.error("Streaming error:", error);
          setIsTyping(false);
          isSendingMessageRef.current = false;
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
            })
          );
        },
        () => {
          setIsTyping(false);
          isSendingMessageRef.current = false;
        }
      );
    },
    [currentChatId]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!inputValue.trim() || isTyping) return;
      await handleSendMessage(inputValue.trim());
    },
    [inputValue, isTyping, handleSendMessage]
  );

  const handleResetChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
    setInputValue("");
    setIsTyping(false);
  }, []);

  const handleSelectPreviousChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            onClick={handleResetChat}
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
              className="w-[240px] max-h-[360px] rounded-lg"
            >
              <ChatHistory
                onSelectChat={handleSelectPreviousChat}
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold">Ask me anything</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {INITIAL_MESSAGES.map((message) => (
                    <Button
                      key={message}
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => handleSendMessage(message)}
                    >
                      {message}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-3">
                <Message from={message.role}>
                  <MessageContent>
                    {message.isStreaming && !message.content.trim() ? (
                      <div className="flex items-center gap-2">
                        <Spinner size={14} />
                        <span className="text-muted-foreground text-sm">
                          Thinking...
                        </span>
                      </div>
                    ) : (
                      <MarkdownViewer content={message.content} />
                    )}
                  </MessageContent>
                </Message>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div className="p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Memr anything..."
            disabled={isTyping}
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
