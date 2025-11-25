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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedChatIdRef = useRef<string | null>(null);
  const isSendingMessageRef = useRef(false);

  const { data: historyData, isLoading: isLoadingHistory } =
    chatApiHook.useGetChatHistory(currentChatId);

  const historyMessages = useMemo(() => {
    if (!historyData?.data?.messages || !currentChatId) return [];
    return historyData.data.messages.map((msg) => ({
      id: msg.id,
      content: msg.content || "",
      role: msg.role as "user" | "assistant",
      timestamp: parseISO(msg.createdAt),
      isStreaming: false,
    }));
  }, [historyData, currentChatId]);

  useEffect(() => {
    if (!currentChatId) {
      if (loadedChatIdRef.current !== null) {
        loadedChatIdRef.current = null;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages([]);
      }
      return;
    }

    if (isSendingMessageRef.current) return;

    if (currentChatId !== loadedChatIdRef.current && historyMessages.length > 0) {
      setMessages(historyMessages);
      loadedChatIdRef.current = currentChatId;
    }
  }, [currentChatId, historyMessages]);

  const updateAssistantMessage = useCallback(
    (messageId: string, updater: (msg: ChatMessage) => ChatMessage) => {
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? updater(msg) : msg)));
    },
    []
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      let chatId = currentChatId;
      if (!chatId) {
        const data = await chatApi.startChat();
        if (!data.data?.id) return;
        chatId = data.data.id;
        setCurrentChatId(chatId);
        loadedChatIdRef.current = chatId;
      }

      const messageContent = message.trim();
      isSendingMessageRef.current = true;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: messageContent,
        role: "user",
        timestamp: new Date(),
      };

      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInputValue("");
      setIsTyping(true);

      const finishStreaming = () => {
        setIsTyping(false);
        isSendingMessageRef.current = false;
      };

      chatApi.sendMessageStream(
        chatId,
        messageContent,
        (chunk) => {
          updateAssistantMessage(assistantMessageId, (msg) => ({
            ...msg,
            content: msg.content + chunk.content,
            isStreaming: !chunk.done,
          }));

          if (chunk.done) finishStreaming();
        },
        (error) => {
          console.error("Streaming error:", error);
          updateAssistantMessage(assistantMessageId, (msg) => ({
            ...msg,
            content: msg.content || "Error: Failed to get response",
            isStreaming: false,
          }));
          finishStreaming();
        },
        finishStreaming
      );
    },
    [currentChatId, updateAssistantMessage]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!inputValue.trim() || isTyping) return;
      handleSendMessage(inputValue.trim());
    },
    [inputValue, isTyping, handleSendMessage]
  );

  const handleResetChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
    setInputValue("");
    setIsTyping(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-t-xl bg-background shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Chat</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleResetChat} title="New Chat">
            <Plus />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" title="Chat History">
                <History />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              className="w-[240px] max-h-[360px] rounded-lg"
            >
              <ChatHistory onSelectChat={setCurrentChatId} selectedChatId={currentChatId} />
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
                        <span className="text-muted-foreground text-sm">Thinking...</span>
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
            <PromptInputTools />
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
