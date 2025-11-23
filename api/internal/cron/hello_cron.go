package cron

import (
	"app/internal/config"
	"app/pkg/logger"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

type HelloCron struct {
	cron *cron.Cron
}

func NewHelloCron(ctx context.Context) *HelloCron {
	c := cron.New(cron.WithSeconds())

	helloCron := &HelloCron{
		cron: c,
	}

	// Schedule job to run every 1 minute
	_, err := c.AddFunc("0 * * * * *", helloCron.hitHelloEndpoint)
	if err != nil {
		logger.Log.Error("Failed to schedule hello cron job", zap.Error(err))
		return helloCron
	}

	// Start cron in a goroutine
	go func() {
		c.Start()
		logger.Log.Info("Hello cron job started - will hit GET /hello every 1 minute")

		// Wait for context cancellation
		<-ctx.Done()
		c.Stop()
		logger.Log.Info("Hello cron job stopped")
	}()

	return helloCron
}

func (h *HelloCron) hitHelloEndpoint() {
	url := fmt.Sprintf("%s/hello", config.Env.App.BaseURL)

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		logger.Log.Error("Failed to hit /hello endpoint",
			zap.String("url", url),
			zap.Error(err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logger.Log.Warn("Unexpected status code from /hello endpoint",
			zap.String("url", url),
			zap.Int("status", resp.StatusCode))
		return
	}

	logger.Log.Info("Successfully hit /hello endpoint",
		zap.String("url", url),
		zap.Int("status", resp.StatusCode))
}
