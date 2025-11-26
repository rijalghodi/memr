package usecase

import (
	"app/internal/agent"
	"app/internal/contract"
	"app/internal/repository"
	"app/pkg/logger"
	"app/pkg/openai"
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type ChatUsecase struct {
	userRepo     *repository.UserRepository
	chatRepo     *repository.ChatRepository
	agent        *agent.Agent
	openaiClient *openai.OpenAIClient
}

func NewChatUsecase(userRepo *repository.UserRepository, chatRepo *repository.ChatRepository, agent *agent.Agent, openaiClient *openai.OpenAIClient) *ChatUsecase {
	return &ChatUsecase{
		userRepo:     userRepo,
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
		ID: chat.ID,
	}, nil
}

func (u *ChatUsecase) SendMessage(ctx context.Context, chatID, userID, message string) (*contract.ChatSendRes, error) {
	// Verify chat belongs to user
	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}
	if user == nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
	}

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

	// Check message limit: months since user creation * 30
	userMessageCount, err := u.chatRepo.CountUserMessages(ctx, userID)
	if err != nil {
		logger.Log.Error("Failed to count user messages", zap.Error(err))
		return nil, err
	}

	// Calculate months since user creation
	monthsSinceCreation := calculateMonthsSince(user.CreatedAt, time.Now())
	maxMessages := monthsSinceCreation * 30

	if userMessageCount > int64(maxMessages) {
		logger.Log.Warn("User message limit exceeded",
			zap.String("userID", userID),
			zap.Int64("messageCount", userMessageCount),
			zap.Int("maxMessages", maxMessages),
			zap.Int("monthsSinceCreation", monthsSinceCreation),
		)
		return nil, fiber.NewError(fiber.StatusForbidden, "Message limit exceeded. You have reached your monthly message limit.")
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

	// Load and template system prompt
	systemPrompt, err := u.getSystemPrompt(user.Name, user.Email)
	if err != nil {
		logger.Log.Warn("Failed to load system prompt, using default", zap.Error(err))
		systemPrompt = "You are a helpful assistant that can search notes and tasks. Use the available tools to help users find information."
	}

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

	return &contract.ChatSendRes{
		AssistantMessage: assistantResponse.Content,
	}, nil
}

// StreamWriter interface for writing SSE-formatted chunks
type StreamWriter interface {
	WriteChunk(chunk contract.ChatStreamChunk) error
}

// SendMessageStream sends a message and streams the response
func (u *ChatUsecase) SendMessageStream(ctx context.Context, chatID, userID, message string, writer StreamWriter) error {
	// Verify chat belongs to user
	user, err := u.userRepo.GetUserByID(userID)
	if err != nil {
		logger.Log.Error("Failed to get user", zap.Error(err), zap.String("userID", userID))
		return err
	}
	if user == nil {
		return fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	chat, err := u.chatRepo.GetChatByID(ctx, chatID, userID)
	if err != nil {
		logger.Log.Error("Failed to get chat", zap.Error(err), zap.String("chatID", chatID))
		return err
	}
	if chat == nil {
		return fiber.NewError(fiber.StatusNotFound, "Chat not found")
	}

	// Insert user message
	_, err = u.chatRepo.CreateMessage(ctx, chatID, userID, "user", message)
	if err != nil {
		logger.Log.Error("Failed to create user message", zap.Error(err))
		return err
	}

	// Check message limit: months since user creation * 30
	userMessageCount, err := u.chatRepo.CountUserMessages(ctx, userID)
	if err != nil {
		logger.Log.Error("Failed to count user messages", zap.Error(err))
		return err
	}

	// Calculate months since user creation
	monthsSinceCreation := calculateMonthsSince(user.CreatedAt, time.Now())
	maxMessages := monthsSinceCreation * 30

	if userMessageCount > int64(maxMessages) {
		logger.Log.Warn("User message limit exceeded",
			zap.String("userID", userID),
			zap.Int64("messageCount", userMessageCount),
			zap.Int("maxMessages", maxMessages),
			zap.Int("monthsSinceCreation", monthsSinceCreation),
		)
		// Send error chunk
		errorChunk := contract.ChatStreamChunk{
			Error: "Message limit exceeded. You have reached your monthly message limit.",
			Done:  true,
		}
		writer.WriteChunk(errorChunk)
		return fiber.NewError(fiber.StatusForbidden, "Message limit exceeded. You have reached your monthly message limit.")
	}

	// Load chat history
	messages, err := u.chatRepo.GetChatHistory(ctx, chatID)
	if err != nil {
		logger.Log.Error("Failed to get chat history", zap.Error(err))
		return err
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

	// Load and template system prompt
	systemPrompt, err := u.getSystemPrompt(user.Name, user.Email)
	if err != nil {
		logger.Log.Warn("Failed to load system prompt, using default", zap.Error(err))
		systemPrompt = "You are a helpful assistant that can search notes and tasks. Use the available tools to help users find information."
	}

	// Process message with agent (streaming)
	var finalContent string
	assistantResponse, err := u.agent.ProcessMessageStream(ctx, userID, systemPrompt, openaiMessages, func(deltaContent string) error {
		// Write delta chunk
		chunk := contract.ChatStreamChunk{
			Content: deltaContent,
			Done:    false,
		}
		if err := writer.WriteChunk(chunk); err != nil {
			return err
		}
		finalContent += deltaContent
		return nil
	})

	if err != nil {
		logger.Log.Error("Failed to process message", zap.Error(err))
		// Send error chunk
		errorChunk := contract.ChatStreamChunk{
			Error: err.Error(),
			Done:  true,
		}
		writer.WriteChunk(errorChunk)
		return err
	}

	// Send final chunk
	finalChunk := contract.ChatStreamChunk{
		Content: "",
		Done:    true,
	}
	if err := writer.WriteChunk(finalChunk); err != nil {
		logger.Log.Warn("Failed to write final chunk", zap.Error(err))
	}

	// Store final message in database
	if assistantResponse != nil {
		contentToStore := finalContent
		if contentToStore == "" && assistantResponse.Content != "" {
			contentToStore = assistantResponse.Content
		}
		_, err = u.chatRepo.CreateMessage(ctx, chatID, userID, "assistant", contentToStore)
		if err != nil {
			logger.Log.Error("Failed to create assistant message", zap.Error(err))
			// Don't return error here - message was already streamed
		}
	}

	return nil
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

// getSystemPrompt loads the system prompt template and fills in user data
func (u *ChatUsecase) getSystemPrompt(userName, userEmail string) (string, error) {
	// Try multiple possible locations for the prompt file
	// This handles both development and production scenarios
	possiblePaths := []string{
		"assets/chat-prompt.md",     // Relative to current working directory
		"api/assets/chat-prompt.md", // Relative to current working directory (if in repo root)
		filepath.Join(filepath.Dir(os.Args[0]), "assets/chat-prompt.md"), // Relative to executable
	}

	// Also try relative to current working directory
	if wd, err := os.Getwd(); err == nil {
		possiblePaths = append(possiblePaths,
			filepath.Join(wd, "assets/chat-prompt.md"),
			filepath.Join(wd, "api/assets/chat-prompt.md"),
		)
	}

	var content []byte
	var err error
	for _, path := range possiblePaths {
		content, err = os.ReadFile(path)
		if err == nil {
			break
		}
	}

	if err != nil {
		return "", err
	}

	// Replace Mustache template variables with user data
	prompt := string(content)
	prompt = strings.ReplaceAll(prompt, "{{user_name}}", userName)
	prompt = strings.ReplaceAll(prompt, "{{user_email}}", userEmail)

	return prompt, nil
}

// calculateMonthsSince calculates the number of months between two dates
// Returns at least 1 month (minimum) to ensure users always have at least 30 messages
func calculateMonthsSince(from, to time.Time) int {
	if from.After(to) {
		return 1 // Minimum 1 month
	}

	years := to.Year() - from.Year()
	months := int(to.Month()) - int(from.Month())

	totalMonths := years*12 + months

	// If the day of month in 'to' is before 'from', we haven't completed a full month
	if to.Day() < from.Day() {
		totalMonths--
	}

	// Ensure at least 1 month
	if totalMonths < 1 {
		return 1
	}

	return totalMonths
}
