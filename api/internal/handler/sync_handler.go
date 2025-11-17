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

type SyncHandler struct {
	syncUsecase *usecase.SyncUsecase
}

func NewSyncHandler(syncUsecase *usecase.SyncUsecase) *SyncHandler {
	return &SyncHandler{syncUsecase: syncUsecase}
}

func (h *SyncHandler) RegisterRoutes(app *fiber.App) {
	app.Post("/v1/sync", middleware.AuthGuard(), h.Sync)
}

// @Tags Sync
// @Summary Sync data
// @Description Sync data between client and server
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body contract.SyncReq true "Sync request"
// @Success 200 {object} util.BaseResponse{data=contract.SyncRes}
// @Failure 400 {object} util.BaseResponse
// @Failure 401 {object} util.BaseResponse
// @Router /v1/sync [post]
func (h *SyncHandler) Sync(c *fiber.Ctx) error {
	var req contract.SyncReq
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
		return err
	}

	res, err := h.syncUsecase.Sync(c, claims.ID, &req)
	if err != nil {
		logger.Log.Warn("Failed to sync data", zap.Error(err))
		return err
	}

	return c.JSON(res)
}
