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

// StartChat creates a new chat session
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

// SendMessage processes a user message and returns the assistant's response
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
		openaiMsg := openai.ChatMessage{
			Role: msg.Role,
		}
		if msg.Content != nil {
			openaiMsg.Content = *msg.Content
		}

		// Handle tool calls
		if len(msg.ToolCalls) > 0 {
			toolCalls := make([]openai.ChatToolCall, 0, len(msg.ToolCalls))
			for _, tc := range msg.ToolCalls {
				var args map[string]interface{}
				// Use GetArgumentsBytes helper method
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

		// Handle tool responses
		// Note: Tool responses are stored as messages with role "tool" in the database
		// We need to check if this message is a tool response by checking if it has a tool_call_id
		// For simplicity, we'll handle this in the agent processing

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
	_, err = u.chatRepo.CreateMessage(ctx, chatID, userID, "assistant", assistantResponse)
	if err != nil {
		logger.Log.Error("Failed to create assistant message", zap.Error(err))
		return nil, err
	}

	// Note: Tool calls are stored during agent processing if needed
	// For now, we'll store them separately if the agent returns tool calls
	// This is a simplified version - in production, you'd want to store tool calls from the agent loop

	return &contract.ChatSendRes{
		AssistantMessage: assistantResponse,
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
