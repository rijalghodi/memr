package handler

import (
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/logger"
	"app/pkg/util"

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
	app.Post("/v1/chat/start", middleware.AuthGuard(), h.StartChat)
	app.Post("/v1/chat/send", middleware.AuthGuard(), h.SendMessage)
	app.Get("/v1/chat/:chat_id/history", middleware.AuthGuard(), h.GetChatHistory)
}

// @Tags Chat
// @Summary Start a new chat
// @Description Create a new chat session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} util.BaseResponse{data=contract.ChatStartRes}
// @Failure 401 {object} util.BaseResponse
// @Router /v1/chat/start [post]
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
// @Router /v1/chat/send [post]
func (h *ChatHandler) SendMessage(c *fiber.Ctx) error {
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

	res, err := h.chatUsecase.SendMessage(c.Context(), req.ChatID, claims.ID, req.Message)
	if err != nil {
		logger.Log.Error("Failed to send message", zap.Error(err))
		return err
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
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
// @Router /v1/chat/{chat_id}/history [get]
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

