package agent

import (
	"app/internal/model"
	"app/pkg/logger"
	"context"
	"time"

	"github.com/pgvector/pgvector-go"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AgentRepository struct {
	db *gorm.DB
}

func NewAgentRepository(db *gorm.DB) *AgentRepository {
	return &AgentRepository{db: db}
}

// SearchNotes performs vector similarity search on notes
func (r *AgentRepository) SearchNotes(ctx context.Context, userID string, queryEmbedding []float32, limit int) ([]model.Note, error) {
	var notes []model.Note

	if len(queryEmbedding) == 0 {
		return notes, nil
	}

	queryVector := pgvector.NewVector(queryEmbedding)

	err := r.db.WithContext(ctx).
		Raw("SELECT id, user_id, collection_id, title, content, embedding, created_at, updated_at, deleted_at FROM notes WHERE user_id = ? AND deleted_at IS NULL AND embedding IS NOT NULL ORDER BY embedding <-> ? LIMIT ?", userID, queryVector, limit).
		Scan(&notes).Error

	if err != nil {
		logger.Log.Error("Failed to search notes", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}

	return notes, nil
}

// SearchTasks performs filtered search on tasks
func (r *AgentRepository) SearchTasks(ctx context.Context, userID string, filters TaskSearchFilters) ([]model.Task, error) {
	var tasks []model.Task

	query := r.db.WithContext(ctx).
		Where("user_id = ? AND deleted_at IS NULL", userID)

	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}

	if filters.DueFrom != nil {
		query = query.Where("due_date >= ?", *filters.DueFrom)
	}

	if filters.DueTo != nil {
		query = query.Where("due_date <= ?", *filters.DueTo)
	}

	if filters.ProjectID != nil {
		query = query.Where("project_id = ?", *filters.ProjectID)
	}

	if filters.Search != nil && *filters.Search != "" {
		searchPattern := "%" + *filters.Search + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", searchPattern, searchPattern)
	}

	query = query.Order("due_date ASC NULLS LAST")

	err := query.Find(&tasks).Error
	if err != nil {
		logger.Log.Error("Failed to search tasks", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}

	return tasks, nil
}

// TaskSearchFilters represents filters for task search
type TaskSearchFilters struct {
	Status    *int       `json:"status"`
	DueFrom   *time.Time `json:"due_from"`
	DueTo     *time.Time `json:"due_to"`
	ProjectID *string    `json:"project_id"`
	Search    *string    `json:"search"`
}
