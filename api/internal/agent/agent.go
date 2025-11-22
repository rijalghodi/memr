package agent

import (
	"app/pkg/logger"
	"app/pkg/openai"
	"context"
	"fmt"

	"go.uber.org/zap"
)

type Agent struct {
	openaiClient *openai.OpenAIClient
	toolExecutor *ToolExecutor
}

func NewAgent(openaiClient *openai.OpenAIClient, toolExecutor *ToolExecutor) *Agent {
	return &Agent{
		openaiClient: openaiClient,
		toolExecutor: toolExecutor,
	}
}

// ProcessMessage processes a user message and returns the assistant's response
// It handles tool calling loops until a final response is generated
func (a *Agent) ProcessMessage(ctx context.Context, userID string, systemPrompt string, messages []openai.ChatMessage) (string, error) {
	tools := GetToolDefinitions()
	maxIterations := 10
	iteration := 0

	currentMessages := messages

	for iteration < maxIterations {
		iteration++

		// Call OpenAI
		response, err := a.openaiClient.CreateChatCompletion(ctx, systemPrompt, currentMessages, tools)
		if err != nil {
			logger.Log.Error("Failed to create chat completion", zap.Error(err))
			return "", fmt.Errorf("failed to create chat completion: %w", err)
		}

		// If no tool calls, return the final message
		if len(response.Message.ToolCalls) == 0 {
			return response.Message.Content, nil
		}

		// Add assistant message with tool calls to conversation
		currentMessages = append(currentMessages, response.Message)

		// Execute tool calls and add results to conversation
		for _, toolCall := range response.Message.ToolCalls {
			if toolCall.Type != "function" {
				continue
			}

			toolName := toolCall.Function.Name
			arguments := toolCall.Function.Arguments

			var toolResult string
			var toolErr error

			// Execute the appropriate tool
			switch toolName {
			case "search_notes":
				toolResult, toolErr = a.toolExecutor.SearchNotesTool(ctx, userID, arguments)
			case "search_tasks":
				toolResult, toolErr = a.toolExecutor.SearchTasksTool(ctx, userID, arguments)
			default:
				toolErr = fmt.Errorf("unknown tool: %s", toolName)
			}

			if toolErr != nil {
				logger.Log.Error("Tool execution failed", zap.Error(toolErr), zap.String("tool", toolName))
				toolResult = fmt.Sprintf(`{"error": "%s"}`, toolErr.Error())
			}

			// Add tool result to conversation
			toolCallID := toolCall.ID
			currentMessages = append(currentMessages, openai.ChatMessage{
				Role:       "tool",
				Content:    toolResult,
				ToolCallID: &toolCallID,
				Name:       &toolName,
			})
		}
	}

	// If we've exceeded max iterations, return the last message content
	if len(currentMessages) > 0 {
		lastMsg := currentMessages[len(currentMessages)-1]
		if lastMsg.Role == "assistant" {
			return lastMsg.Content, nil
		}
	}

	return "", fmt.Errorf("max iterations reached without final response")
}
