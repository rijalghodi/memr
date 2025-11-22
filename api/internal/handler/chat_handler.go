package handler

import (
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/logger"
	"app/pkg/util"
	"bufio"
	"context"
	"encoding/json"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type ChatHandler struct {
	chatUsecase *usecase.ChatUsecase
}

func NewChatHandler(chatUsecase *usecase.ChatUsecase) *ChatHandler {
	return &ChatHandler{
		chatUsecase: chatUsecase,
	}
}

func (h *ChatHandler) RegisterRoutes(app *fiber.App) {
	chatGroup := app.Group("/v1/chats")
	chatGroup.Post("", middleware.AuthGuard(), h.StartChat)
	chatGroup.Get("", middleware.AuthGuard(), h.ListChats)
	chatGroup.Post("/:chat_id/messages", middleware.AuthGuard(), h.SendMessage)
	chatGroup.Get("/:chat_id/messages", middleware.AuthGuard(), h.GetChatHistory)
}

// @Tags Chat
// @Summary Start a new chat
// @Description Create a new chat session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} util.BaseResponse{data=contract.ChatStartRes}
// @Failure 401 {object} util.BaseResponse
// @Router /v1/chats [post]
func (h *ChatHandler) StartChat(c *fiber.Ctx) error {
	claims, err := middleware.GetAuthClaims(c)
	if err != nil {
		logger.Log.Warn("Failed to get auth claims", zap.Error(err))
		return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	res, err := h.chatUsecase.StartChat(c.Context(), claims.ID)
	if err != nil {
		logger.Log.Error("Failed to start chat", zap.Error(err))
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
}

// @Tags Chat
// @Summary List chats
// @Description Get a paginated list of chats for the authenticated user
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number (default: 1)" default(1)
// @Param limit query int false "Items per page (default: 20)" default(20)
// @Success 200 {object} util.BaseResponse{data=contract.ChatListRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Router /v1/chats [get]
func (h *ChatHandler) ListChats(c *fiber.Ctx) error {
	claims, err := middleware.GetAuthClaims(c)
	if err != nil {
		logger.Log.Warn("Failed to get auth claims", zap.Error(err))
		return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	// Parse pagination parameters
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	// Validate pagination parameters
	if page < 1 {
		return fiber.NewError(fiber.StatusBadRequest, "page must be greater than 0")
	}
	if limit < 1 || limit > 100 {
		return fiber.NewError(fiber.StatusBadRequest, "limit must be between 1 and 100")
	}

	chats, total, err := h.chatUsecase.ListChats(c.Context(), claims.ID, page, limit)
	if err != nil {
		logger.Log.Error("Failed to list chats", zap.Error(err))
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToPaginatedResponse(chats, page, limit, total))
}

// @Tags Chat
// @Summary Send a message
// @Description Send a message to the chat and get assistant response
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.ChatSendReq true "Send message request"
// @Success 200 {object} util.BaseResponse{data=contract.ChatSendRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Router /v1/chats/{chat_id}/messages [post]
func (h *ChatHandler) SendMessage(c *fiber.Ctx) error {
	chatID := c.Params("chat_id")
	if chatID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "chat_id is required")
	}

	var req contract.ChatSendReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body", zap.Error(err))
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error", zap.Error(err))
		return err
	}

	claims, err := middleware.GetAuthClaims(c)
	if err != nil {
		logger.Log.Warn("Failed to get auth claims", zap.Error(err))
		return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	// Check if streaming is requested
	streamParam := c.Query("stream", "false")
	if streamParam == "true" {
		return h.handleStreamingMessage(c, chatID, claims.ID, req.Message)
	}

	// Non-streaming response (backward compatible)
	res, err := h.chatUsecase.SendMessage(c.Context(), chatID, claims.ID, req.Message)
	if err != nil {
		logger.Log.Error("Failed to send message", zap.Error(err))
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
}

// handleStreamingMessage handles streaming response using SSE
func (h *ChatHandler) handleStreamingMessage(c *fiber.Ctx, chatID, userID, message string) error {
	// Set SSE headers
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("X-Accel-Buffering", "no") // Disable buffering for nginx

	// Capture the request context before the stream writer function runs
	// This ensures the context is valid when used in the goroutine
	// c.Context() returns *fasthttp.RequestCtx which implements context.Context
	requestCtx := c.Context()
	if requestCtx == nil {
		logger.Log.Error("Request context is nil in streaming handler")
		return fiber.NewError(fiber.StatusInternalServerError, "Invalid request context")
	}

	// Create stream writer that implements usecase.StreamWriter
	// requestCtx implements context.Context, so we can use it directly
	streamWriter := &SSEStreamWriter{ctx: requestCtx}

	// Use Fiber's SetBodyStreamWriter for efficient streaming
	c.Context().Response.SetBodyStreamWriter(func(w *bufio.Writer) {
		// Update stream writer with the actual writer
		streamWriter.writer = w

		// Call usecase to stream the message using the captured context
		err := h.chatUsecase.SendMessageStream(requestCtx, chatID, userID, message, streamWriter)
		if err != nil {
			logger.Log.Error("Failed to stream message", zap.Error(err), zap.String("chatID", chatID))
			// Try to send error chunk
			errorChunk := contract.ChatStreamChunk{
				Error: err.Error(),
				Done:  true,
			}
			streamWriter.WriteChunk(errorChunk)
		}
	})

	return nil
}

// SSEStreamWriter implements usecase.StreamWriter for SSE format
type SSEStreamWriter struct {
	ctx    context.Context
	writer *bufio.Writer
}

func (w *SSEStreamWriter) WriteChunk(chunk contract.ChatStreamChunk) error {
	// Check if context is cancelled (client disconnected)
	select {
	case <-w.ctx.Done():
		return fmt.Errorf("client disconnected")
	default:
	}

	// Marshal chunk to JSON
	chunkJSON, err := json.Marshal(chunk)
	if err != nil {
		return fmt.Errorf("failed to marshal chunk: %w", err)
	}

	// Write SSE format: data: <json>\n\n
	sseData := fmt.Sprintf("data: %s\n\n", string(chunkJSON))
	_, err = w.writer.WriteString(sseData)
	if err != nil {
		return fmt.Errorf("failed to write chunk: %w", err)
	}

	// Flush to send immediately
	if err := w.writer.Flush(); err != nil {
		return fmt.Errorf("failed to flush: %w", err)
	}

	return nil
}

// @Tags Chat
// @Summary Get chat history
// @Description Get the message history for a chat
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param chat_id path string true "Chat ID"
// @Success 200 {object} util.BaseResponse{data=contract.ChatHistoryRes}
// @Failure 401 {object} util.BaseResponse
// @Failure 404 {object} util.BaseResponse
// @Router /v1/chats/{chat_id}/messages [get]
func (h *ChatHandler) GetChatHistory(c *fiber.Ctx) error {
	chatID := c.Params("chat_id")
	if chatID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "chat_id is required")
	}

	claims, err := middleware.GetAuthClaims(c)
	if err != nil {
		logger.Log.Warn("Failed to get auth claims", zap.Error(err))
		return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	res, err := h.chatUsecase.GetChatHistory(c.Context(), chatID, claims.ID)
	if err != nil {
		logger.Log.Error("Failed to get chat history", zap.Error(err))
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
}
