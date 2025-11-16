package usecase

import (
	"app/internal/contract"
	"app/internal/repository"
	"app/pkg/logger"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type SyncUsecase struct {
	syncRepo *repository.SyncRepository
}

func NewSyncUsecase(syncRepo *repository.SyncRepository) *SyncUsecase {
	return &SyncUsecase{syncRepo: syncRepo}
}

func (u *SyncUsecase) Sync(c *fiber.Ctx, userID string, req *contract.SyncReq) (res *contract.SyncRes, err error) {
	logger.Log.Info("Syncing data", zap.String("userID", userID), zap.Any("req", req))
	lastSyncTime, changes, err := u.syncRepo.Sync(userID, req)
	if err != nil {
		logger.Log.Error("Failed to sync data", zap.Error(err))
		return nil, err
	}
	return &contract.SyncRes{
		Changes:      changes,
		LastSyncTime: lastSyncTime.Format(time.RFC3339),
	}, nil
}
