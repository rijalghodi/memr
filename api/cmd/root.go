package cmd

import (
	"fmt"
	"os"
)

// Execute is the entry point for all commands
func Execute() error {
	if len(os.Args) < 2 {
		return fmt.Errorf("no command specified. Available commands: http")
	}

	command := os.Args[1]

	switch command {
	case "http":
		return RunHTTP()
	default:
		return fmt.Errorf("unknown command: %s. Available commands: http", command)
	}
}
