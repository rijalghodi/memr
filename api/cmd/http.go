package cmd

import (
	"app/internal/app"
)

// RunHTTP starts the HTTP server
func RunHTTP() error {
	return app.Run()
}
