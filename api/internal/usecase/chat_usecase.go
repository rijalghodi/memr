package usecase

import (
	"app/internal/agent"
	"app/internal/contract"
	"app/internal/repository"
	"app/pkg/logger"
	"app/pkg/openai"
	"context"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type ChatUsecase struct {
	chatRepo     *repository.ChatRepository
	agent        *agent.Agent
	openaiClient *openai.OpenAIClient
}

func NewChatUsecase(chatRepo *repository.ChatRepository, agent *agent.Agent, openaiClient *openai.OpenAIClient) *ChatUsecase {
	return &ChatUsecase{
		chatRepo:     chatRepo,
		agent:        agent,
		openaiClient: openaiClient,
	}
}

func (u *ChatUsecase) StartChat(ctx context.Context, userID string) (*contract.ChatStartRes, error) {
	chat, err := u.chatRepo.CreateChat(ctx, userID)
	if err != nil {
		logger.Log.Error("Failed to create chat", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}

	return &contract.ChatStartRes{
		ChatID: chat.ID,
	}, nil
}

func (u *ChatUsecase) SendMessage(ctx context.Context, chatID, userID, message string) (*contract.ChatSendRes, error) {
	// Verify chat belongs to user
	chat, err := u.chatRepo.GetChatByID(ctx, chatID, userID)
	if err != nil {
		logger.Log.Error("Failed to get chat", zap.Error(err), zap.String("chatID", chatID))
		return nil, err
	}
	if chat == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Chat not found")
	}

	// Insert user message
	_, err = u.chatRepo.CreateMessage(ctx, chatID, userID, "user", message)
	if err != nil {
		logger.Log.Error("Failed to create user message", zap.Error(err))
		return nil, err
	}

	// Load chat history
	messages, err := u.chatRepo.GetChatHistory(ctx, chatID)
	if err != nil {
		logger.Log.Error("Failed to get chat history", zap.Error(err))
		return nil, err
	}

	// Convert to OpenAI message format
	openaiMessages := make([]openai.ChatMessage, 0, len(messages))

	for _, msg := range messages {
		if msg.Role == "tool" {
			openaiMessages = append(openaiMessages, openai.ChatMessage{
				Role:    "tool",
				Content: *msg.Content,
			})
			continue
		}

		openaiMsg := openai.ChatMessage{
			Role: msg.Role,
		}
		if msg.Content != nil {
			openaiMsg.Content = *msg.Content
		}

		// Handle tool calls for assistant messages
		if msg.Role == "assistant" && len(msg.ToolCalls) > 0 {
			toolCalls := make([]openai.ChatToolCall, 0, len(msg.ToolCalls))

			for _, tc := range msg.ToolCalls {
				var args map[string]interface{}
				if err := json.Unmarshal(tc.GetArgumentsBytes(), &args); err != nil {
					logger.Log.Warn("Failed to unmarshal tool call arguments", zap.Error(err))
					continue
				}
				toolCalls = append(toolCalls, openai.ChatToolCall{
					ID:   tc.ID,
					Type: "function",
					Function: openai.ChatFunctionCall{
						Name:      *tc.Name,
						Arguments: args,
					},
				})
			}
			openaiMsg.ToolCalls = toolCalls
		}

		openaiMessages = append(openaiMessages, openaiMsg)
	}

	// System prompt
	systemPrompt := "You are a helpful assistant that can search notes and tasks. Use the available tools to help users find information."

	// Process message with agent
	assistantResponse, err := u.agent.ProcessMessage(ctx, userID, systemPrompt, openaiMessages)
	if err != nil {
		logger.Log.Error("Failed to process message", zap.Error(err))
		return nil, err
	}

	// Insert assistant message
	_, err = u.chatRepo.CreateMessage(ctx, chatID, userID, "assistant", assistantResponse.Content)
	if err != nil {
		logger.Log.Error("Failed to create assistant message", zap.Error(err))
		return nil, err
	}

	// Note: Tool calls are stored during agent processing if needed
	// For now, we'll store them separately if the agent returns tool calls
	// This is a simplified version - in production, you'd want to store tool calls from the agent loop

	return &contract.ChatSendRes{
		AssistantMessage: assistantResponse.Content,
	}, nil
}

// GetChatHistory retrieves the chat history
func (u *ChatUsecase) GetChatHistory(ctx context.Context, chatID, userID string) (*contract.ChatHistoryRes, error) {
	// Verify chat belongs to user
	chat, err := u.chatRepo.GetChatByID(ctx, chatID, userID)
	if err != nil {
		logger.Log.Error("Failed to get chat", zap.Error(err), zap.String("chatID", chatID))
		return nil, err
	}
	if chat == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Chat not found")
	}

	// Get messages
	messages, err := u.chatRepo.GetChatHistory(ctx, chatID)
	if err != nil {
		logger.Log.Error("Failed to get chat history", zap.Error(err))
		return nil, err
	}

	// Convert to response format
	messageRes := make([]contract.MessageRes, 0, len(messages))
	for _, msg := range messages {
		msgRes := contract.MessageRes{
			ID:        msg.ID,
			Role:      msg.Role,
			Content:   msg.Content,
			CreatedAt: msg.CreatedAt.UTC().Format(time.RFC3339),
		}

		// Add tool calls if present
		if len(msg.ToolCalls) > 0 {
			toolCalls := make([]contract.ToolCallRes, 0, len(msg.ToolCalls))
			for _, tc := range msg.ToolCalls {
				var args map[string]interface{}
				if err := json.Unmarshal(tc.GetArgumentsBytes(), &args); err != nil {
					logger.Log.Warn("Failed to unmarshal tool call arguments", zap.Error(err))
					continue
				}
				toolCalls = append(toolCalls, contract.ToolCallRes{
					ID:        tc.ID,
					Name:      tc.Name,
					Arguments: args,
					CreatedAt: tc.CreatedAt.UTC().Format(time.RFC3339),
				})
			}
			msgRes.ToolCalls = toolCalls
		}

		messageRes = append(messageRes, msgRes)
	}

	return &contract.ChatHistoryRes{
		Messages: messageRes,
	}, nil
}

// ListChats retrieves chats for a user with pagination
func (u *ChatUsecase) ListChats(ctx context.Context, userID string, page, limit int) (chats []contract.ChatRes, total int64, err error) {
	chatsDB, total, err := u.chatRepo.ListChatsByUserID(ctx, userID, page, limit)
	if err != nil {
		logger.Log.Error("Failed to list chats", zap.Error(err), zap.String("userID", userID))
		return nil, 0, err
	}

	// Convert to response format
	chatRes := make([]contract.ChatRes, 0, len(chatsDB))
	for _, chat := range chatsDB {
		firstMessage := ""
		updatedAt := chat.CreatedAt

		// Find first user message
		for _, msg := range chat.Messages {
			if msg.Role == "user" && msg.Content != nil {
				firstMessage = *msg.Content
				// Truncate if too long
				if len(firstMessage) > 100 {
					firstMessage = firstMessage[:100] + "..."
				}
				break
			}
		}

		// Find latest message timestamp (messages are ordered ASC, so last one is latest)
		if len(chat.Messages) > 0 {
			updatedAt = chat.Messages[len(chat.Messages)-1].CreatedAt
		}

		chatRes = append(chatRes, contract.ChatRes{
			ID:           chat.ID,
			FirstMessage: firstMessage,
			CreatedAt:    chat.CreatedAt.UTC().Format(time.RFC3339),
			UpdatedAt:    updatedAt.UTC().Format(time.RFC3339),
		})
	}

	return chatRes, total, nil
}
