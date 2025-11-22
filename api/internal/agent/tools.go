package agent

import (
	"app/pkg/logger"
	"app/pkg/openai"
	"context"
	"encoding/json"
	"fmt"
	"time"

	"go.uber.org/zap"
)

type ToolExecutor struct {
	openaiClient *openai.OpenAIClient
	repo         *AgentRepository
}

func NewToolExecutor(openaiClient *openai.OpenAIClient, repo *AgentRepository) *ToolExecutor {
	return &ToolExecutor{
		openaiClient: openaiClient,
		repo:         repo,
	}
}

// SearchNotesTool executes the search_notes tool
func (e *ToolExecutor) SearchNotesTool(ctx context.Context, userID string, arguments map[string]interface{}) (string, error) {
	query, ok := arguments["query"].(string)
	if !ok || query == "" {
		return "[]", fmt.Errorf("query parameter is required")
	}

	limit := 10
	if limitVal, ok := arguments["limit"].(float64); ok {
		limit = int(limitVal)
		if limit > 50 {
			limit = 50
		}
		if limit < 1 {
			limit = 1
		}
	}

	// Generate embedding for the query
	embedding, err := e.openaiClient.GenerateEmbedding(ctx, query)
	if err != nil {
		logger.Log.Error("Failed to generate embedding for search", zap.Error(err))
		return "[]", fmt.Errorf("failed to generate embedding: %w", err)
	}

	// Search notes
	notes, err := e.repo.SearchNotes(ctx, userID, embedding, limit)
	if err != nil {
		logger.Log.Error("Failed to search notes", zap.Error(err))
		return "[]", fmt.Errorf("failed to search notes: %w", err)
	}

	// Convert to JSON array
	results := make([]map[string]interface{}, 0, len(notes))
	for _, note := range notes {
		result := map[string]interface{}{
			"id":      note.ID,
			"title":   note.Title,
			"content": note.Content,
		}
		results = append(results, result)
	}

	jsonBytes, err := json.Marshal(results)
	if err != nil {
		return "[]", fmt.Errorf("failed to marshal results: %w", err)
	}

	return string(jsonBytes), nil
}

// SearchTasksTool executes the search_tasks tool
func (e *ToolExecutor) SearchTasksTool(ctx context.Context, userID string, arguments map[string]interface{}) (string, error) {
	filters := TaskSearchFilters{}

	// Parse status
	if statusVal, ok := arguments["status"].(float64); ok {
		status := int(statusVal)
		filters.Status = &status
	}

	// Parse due_from
	if dueFromStr, ok := arguments["due_from"].(string); ok && dueFromStr != "" {
		dueFrom, err := time.Parse(time.RFC3339, dueFromStr)
		if err != nil {
			logger.Log.Warn("Failed to parse due_from", zap.Error(err), zap.String("due_from", dueFromStr))
		} else {
			filters.DueFrom = &dueFrom
		}
	}

	// Parse due_to
	if dueToStr, ok := arguments["due_to"].(string); ok && dueToStr != "" {
		dueTo, err := time.Parse(time.RFC3339, dueToStr)
		if err != nil {
			logger.Log.Warn("Failed to parse due_to", zap.Error(err), zap.String("due_to", dueToStr))
		} else {
			filters.DueTo = &dueTo
		}
	}

	// Parse project_id
	if projectID, ok := arguments["project_id"].(string); ok && projectID != "" {
		filters.ProjectID = &projectID
	}

	// Parse search keyword
	if search, ok := arguments["search"].(string); ok && search != "" {
		filters.Search = &search
	}

	// Search tasks
	tasks, err := e.repo.SearchTasks(ctx, userID, filters)
	if err != nil {
		logger.Log.Error("Failed to search tasks", zap.Error(err))
		return "[]", fmt.Errorf("failed to search tasks: %w", err)
	}

	// Convert to JSON array
	results := make([]map[string]interface{}, 0, len(tasks))
	for _, task := range tasks {
		result := map[string]interface{}{
			"id":          task.ID,
			"title":       task.Title,
			"description": task.Description,
			"status":      task.Status,
			"due_date":    nil,
			"project_id":  task.ProjectID,
		}
		if task.DueDate != nil {
			result["due_date"] = task.DueDate.Format(time.RFC3339)
		}
		results = append(results, result)
	}

	jsonBytes, err := json.Marshal(results)
	if err != nil {
		return "[]", fmt.Errorf("failed to marshal results: %w", err)
	}

	return string(jsonBytes), nil
}

// GetToolDefinitions returns the tool definitions for OpenAI
func GetToolDefinitions() []openai.ChatTool {
	return []openai.ChatTool{
		{
			Type: "function",
			Function: openai.ChatToolFunction{
				Name:        "search_notes",
				Description: "Search notes using semantic similarity. Returns notes that are semantically similar to the query.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"query": map[string]interface{}{
							"type":        "string",
							"description": "The search query to find semantically similar notes",
						},
						"limit": map[string]interface{}{
							"type":        "integer",
							"description": "Maximum number of results to return (1-50, default: 10)",
							"minimum":     1,
							"maximum":     50,
						},
					},
					"required": []string{"query"},
				},
			},
		},
		{
			Type: "function",
			Function: openai.ChatToolFunction{
				Name:        "search_tasks",
				Description: "Search and filter tasks by status, due date, project, or keyword search.",
				Parameters: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"status": map[string]interface{}{
							"type":        "integer",
							"description": "Filter by task status (0=pending, 1=in_progress, 2=completed, -1=cancelled)",
						},
						"due_from": map[string]interface{}{
							"type":        "string",
							"description": "Filter tasks with due date from this date (RFC3339 format)",
						},
						"due_to": map[string]interface{}{
							"type":        "string",
							"description": "Filter tasks with due date up to this date (RFC3339 format)",
						},
						"project_id": map[string]interface{}{
							"type":        "string",
							"description": "Filter tasks by project ID (UUID)",
						},
						"search": map[string]interface{}{
							"type":        "string",
							"description": "Keyword search in task title and description",
						},
					},
				},
			},
		},
	}
}
