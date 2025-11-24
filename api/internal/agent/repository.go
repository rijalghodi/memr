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
func (r *AgentRepository) SearchNotes(ctx context.Context, userID string, filters NoteSearchFilters) ([]model.Note, error) {
	var notes []model.Note

	if len(filters.QueryEmbedding) == 0 {
		return notes, nil
	}

	queryVector := pgvector.NewVector(filters.QueryEmbedding)

	baseQuery := "SELECT id, user_id, collection_id, title, content, embedding, created_at, updated_at, deleted_at FROM notes WHERE user_id = ? AND deleted_at IS NULL AND embedding IS NOT NULL"
	args := []interface{}{userID}

	// Add collection_id filter if present
	if filters.CollectionID != nil && *filters.CollectionID != "" {
		baseQuery += " AND collection_id = ?"
		args = append(args, *filters.CollectionID)
	}

	// Similarity ordering and limit
	baseQuery += " ORDER BY embedding <-> ? LIMIT ?"
	args = append(args, queryVector, filters.Limit)

	err := r.db.WithContext(ctx).
		Raw(baseQuery, args...).
		Scan(&notes).Error

	if err != nil {
		logger.Log.Error("Failed to search notes", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}

	for i := range notes {
		notes[i].Collection = &model.Collection{
			Title: notes[i].Collection.Title,
		}
	}

	return notes, nil
}

// NoteSearchFilters represents filters for note search
type NoteSearchFilters struct {
	CollectionID   *string   `json:"collection_id"`
	QueryEmbedding []float32 `json:"query_embedding"`
	Limit          int       `json:"limit"`
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

	if filters.CollectionID != nil {
		query = query.Where("collection_id = ?", *filters.CollectionID)
	}

	query = query.Limit(filters.Limit)

	query = query.Order("due_date ASC NULLS LAST")

	err := query.Preload("Project").Find(&tasks).Error
	if err != nil {
		logger.Log.Error("Failed to search tasks", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}

	return tasks, nil
}

// TaskSearchFilters represents filters for task search
type TaskSearchFilters struct {
	Limit        int        `json:"limit"`
	CollectionID *string    `json:"collection_id"`
	Status       *int       `json:"status"`
	DueFrom      *time.Time `json:"due_from"`
	DueTo        *time.Time `json:"due_to"`
	ProjectID    *string    `json:"project_id"`
	Search       *string    `json:"search"`
}

// List projects
func (r *AgentRepository) ListProjects(ctx context.Context, userID string) ([]model.Project, error) {
	var projects []model.Project

	err := r.db.WithContext(ctx).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Find(&projects).Error

	if err != nil {
		logger.Log.Error("Failed to list projects", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}

	return projects, nil
}

// List collections
func (r *AgentRepository) ListCollections(ctx context.Context, userID string) ([]model.Collection, error) {
	var collections []model.Collection

	err := r.db.WithContext(ctx).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Find(&collections).Error
	if err != nil {
		logger.Log.Error("Failed to list collections", zap.Error(err), zap.String("userID", userID))
		return nil, err
	}

	return collections, nil
}
