package repository

import (
	"app/internal/contract"
	"app/internal/model"
	"app/pkg/logger"
	"app/pkg/openai"
	"app/pkg/util"
	"context"
	"sort"
	"time"

	"github.com/pgvector/pgvector-go"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SyncRepository struct {
	db           *gorm.DB
	openaiClient *openai.OpenAIClient
}

func NewSyncRepository(db *gorm.DB, openaiClient *openai.OpenAIClient) *SyncRepository {
	return &SyncRepository{
		db:           db,
		openaiClient: openaiClient,
	}
}

func (r *SyncRepository) GetChanges(userID string, from string) (changes []contract.Change, err error) {

	var tasks []model.Task
	var projects []model.Project
	var notes []model.Note
	var collections []model.Collection

	err = r.db.Where("user_id = ? AND updated_at > ?", userID, from).Order("updated_at ASC").Unscoped().Find(&tasks).Error
	if err != nil {
		logger.Log.Error("Failed to get tasks", zap.Error(err), zap.String("userID", userID), zap.String("from", from))
		return nil, err
	}
	err = r.db.Where("user_id = ? AND updated_at > ?", userID, from).Order("updated_at ASC").Unscoped().Find(&projects).Error
	if err != nil {
		logger.Log.Error("Failed to get projects", zap.Error(err), zap.String("userID", userID), zap.String("from", from))
		return nil, err
	}
	err = r.db.Where("user_id = ? AND updated_at > ?", userID, from).Order("updated_at ASC").Unscoped().Find(&notes).Error
	if err != nil {
		logger.Log.Error("Failed to get notes", zap.Error(err), zap.String("userID", userID), zap.String("from", from))
		return nil, err
	}
	err = r.db.Where("user_id = ? AND updated_at > ?", userID, from).Order("updated_at ASC").Unscoped().Find(&collections).Error
	if err != nil {
		logger.Log.Error("Failed to get collections", zap.Error(err), zap.String("userID", userID), zap.String("from", from))
		return nil, err
	}

	changes = []contract.Change{}

	for _, task := range tasks {
		changes = append(changes, contract.Change{
			Type:        "task",
			EntityID:    task.ID,
			Title:       task.Title,
			Description: task.Description,
			ProjectID:   task.ProjectID,
			SortOrder:   task.SortOrder,
			DueDate:     util.TimePtrToStringPtr(task.DueDate, time.RFC3339),
			Status:      util.ToPointer(task.Status),
			UpdatedAt:   task.UpdatedAt.UTC().Format(time.RFC3339),
			CreatedAt:   task.CreatedAt.UTC().Format(time.RFC3339),
			DeletedAt:   util.TimePtrToStringPtr(task.DeletedAt, time.RFC3339),
		})
	}

	for _, project := range projects {
		changes = append(changes, contract.Change{
			Type:        "project",
			EntityID:    project.ID,
			Title:       project.Title,
			Description: project.Description,
			Color:       project.Color,
			UpdatedAt:   project.UpdatedAt.UTC().Format(time.RFC3339),
			CreatedAt:   project.CreatedAt.UTC().Format(time.RFC3339),
			DeletedAt:   util.TimePtrToStringPtr(project.DeletedAt, time.RFC3339),
		})
	}

	for _, note := range notes {
		changes = append(changes, contract.Change{
			Type:         "note",
			EntityID:     note.ID,
			CollectionID: note.CollectionID,
			Title:        note.Title,
			Content:      note.Content,
			UpdatedAt:    note.UpdatedAt.UTC().Format(time.RFC3339),
			CreatedAt:    note.CreatedAt.UTC().Format(time.RFC3339),
			DeletedAt:    util.TimePtrToStringPtr(note.DeletedAt, time.RFC3339),
		})
	}

	for _, collection := range collections {
		changes = append(changes, contract.Change{
			Type:        "collection",
			EntityID:    collection.ID,
			Title:       util.ToPointer(collection.Title),
			Description: util.ToPointer(collection.Description),
			Color:       collection.Color,
			UpdatedAt:   collection.UpdatedAt.UTC().Format(time.RFC3339),
			CreatedAt:   collection.CreatedAt.UTC().Format(time.RFC3339),
			DeletedAt:   util.TimePtrToStringPtr(collection.DeletedAt, time.RFC3339),
		})
	}

	// sort changes by updated_at
	sort.Slice(changes, func(i, j int) bool {
		return changes[i].UpdatedAt < changes[j].UpdatedAt
	})

	return changes, nil
}

func (r *SyncRepository) Sync(userID string, req *contract.SyncReq) (lastSyncTime time.Time, changes []contract.Change, err error) {

	tx := r.db.Begin()
	if err = tx.Error; err != nil {
		return lastSyncTime, changes, err
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	for _, change := range req.Changes {
		switch change.Type {
		case "task":
			err = r.syncTask(tx, userID, &change)
			if err != nil {
				logger.Log.Error("Failed to sync task", zap.Error(err), zap.Any("change", change))
				tx.Rollback()
				return lastSyncTime, changes, err
			}
		case "project":
			err = r.syncProject(tx, userID, &change)
			if err != nil {
				logger.Log.Error("Failed to sync project", zap.Error(err), zap.Any("change", change))
				tx.Rollback()
				return lastSyncTime, changes, err
			}
		case "note":
			err = r.syncNote(tx, userID, &change)
			if err != nil {
				logger.Log.Error("Failed to sync note", zap.Error(err), zap.Any("change", change))
				tx.Rollback()
				return lastSyncTime, changes, err
			}
		case "collection":
			err = r.syncCollection(tx, userID, &change)
			if err != nil {
				logger.Log.Error("Failed to sync collection", zap.Error(err), zap.Any("change", change))
				tx.Rollback()
				return lastSyncTime, changes, err
			}
		}
	}

	if err = tx.Commit().Error; err != nil {
		logger.Log.Error("Failed to commit transaction", zap.Error(err))
		return lastSyncTime, changes, err
	}
	lastSyncTime = time.Now()

	changes, err = r.GetChanges(userID, req.LastSyncTime)
	if err != nil {
		logger.Log.Error("Failed to get changes", zap.Error(err), zap.Any("req", req))
		return lastSyncTime, changes, err
	}

	return lastSyncTime, changes, nil
}

func (r *SyncRepository) syncTask(tx *gorm.DB, userID string, change *contract.Change) error {
	var dueDate *time.Time
	if change.DueDate != nil {
		dueDate = util.StringPtrToTimePtr(change.DueDate, time.RFC3339)
	}

	// Prepare only non-falsy updates
	updates := map[string]any{}

	updates["project_id"] = change.ProjectID

	if change.Title != nil {
		updates["title"] = change.Title
	}
	if change.Description != nil {
		updates["description"] = change.Description
	}
	if change.Status != nil {
		updates["status"] = *change.Status
	}
	if change.SortOrder != nil {
		updates["sort_order"] = change.SortOrder
	}
	if dueDate != nil {
		updates["due_date"] = dueDate
	}
	if change.DeletedAt != nil {
		updates["deleted_at"] = change.DeletedAt
	}

	// Try update first
	res := tx.Model(&model.Task{}).
		Where("id = ? AND user_id = ?", change.EntityID, userID).
		Updates(updates)

	if res.Error != nil {
		return res.Error
	}

	// If nothing updated → create
	if res.RowsAffected == 0 {
		var status int
		if change.Status != nil {
			status = *change.Status
		}
		task := &model.Task{
			ID:          change.EntityID,
			ProjectID:   change.ProjectID,
			UserID:      userID,
			Title:       change.Title,
			Description: change.Description,
			Status:      status,
			SortOrder:   change.SortOrder,
			DueDate:     dueDate,
		}
		return tx.Create(task).Error
	}

	return nil
}

func (r *SyncRepository) syncProject(tx *gorm.DB, userID string, change *contract.Change) error {

	// Prepare only non-falsy updates
	updates := map[string]any{}

	if change.Title != nil {
		updates["title"] = change.Title
	}
	if change.Description != nil {
		updates["description"] = change.Description
	}
	if change.Color != nil {
		updates["color"] = change.Color
	}
	if change.DeletedAt != nil {
		updates["deleted_at"] = change.DeletedAt
	}

	// Try update first
	res := tx.Model(&model.Project{}).
		Where("id = ? AND user_id = ?", change.EntityID, userID).
		Updates(updates)

	if res.Error != nil {
		return res.Error
	}

	// If nothing updated → create
	if res.RowsAffected == 0 {
		project := &model.Project{
			ID:          change.EntityID,
			UserID:      userID,
			Title:       change.Title,
			Description: change.Description,
			Color:       change.Color,
		}
		return tx.Create(project).Error
	}

	return nil
}

func (r *SyncRepository) syncNote(tx *gorm.DB, userID string, change *contract.Change) (err error) {
	var embedding *pgvector.Vector
	var embeddingText string
	title := util.ToValue(change.Title)
	content := util.ToValue(change.Content)
	if title != "" {
		embeddingText = "Title: " + title
	}
	if title != "" && content != "" {
		embeddingText += "\n\n"
	}
	if content != "" {
		embeddingText += "Content: " + content
	}

	if embeddingText != "" {
		ctx := context.Background()
		emb, err := r.openaiClient.GenerateEmbedding(ctx, embeddingText)
		if err != nil {
			logger.Log.Error("Failed to generate embedding for note", zap.Error(err), zap.String("noteID", change.EntityID))
			embedding = nil
		} else {
			embedding = util.ToPointer(pgvector.NewVector(emb))
		}
	}

	// Prepare only non-falsy updates
	updates := map[string]any{}

	updates["collection_id"] = change.CollectionID

	if change.Title != nil {
		updates["title"] = *change.Title
	}
	if change.Content != nil {
		updates["content"] = *change.Content
	}
	if embedding != nil {
		updates["embedding"] = embedding
	}

	if change.DeletedAt != nil {
		updates["deleted_at"] = change.DeletedAt
	}

	// TODO: Later, not now. Handle if user want to restore deleted note.

	// Try update first
	res := tx.Model(&model.Note{}).
		Where("id = ? AND user_id = ?", change.EntityID, userID).
		Updates(updates)

	if res.Error != nil {
		return res.Error
	}

	// If nothing updated → create
	if res.RowsAffected == 0 {
		note := &model.Note{
			ID:           change.EntityID,
			UserID:       userID,
			CollectionID: change.CollectionID,
			Title:        change.Title,
			Content:      change.Content,
			Embedding:    embedding,
		}
		return tx.Create(note).Error
	}

	return nil
}

func (r *SyncRepository) syncCollection(tx *gorm.DB, userID string, change *contract.Change) error {
	var deletedAt *time.Time
	if change.DeletedAt != nil {
		deletedDateTime, err := time.Parse(time.RFC3339, util.ToValue(change.DeletedAt))
		if err != nil {
			logger.Log.Warn("Failed to parse deleted at", zap.Error(err), zap.String("deletedAt", util.ToValue(change.DeletedAt)))
			return err
		}
		deletedAt = util.ToPointer(deletedDateTime)
	}

	// Prepare only non-falsy updates
	updates := map[string]any{}

	if change.Title != nil {
		updates["title"] = util.ToValue(change.Title)
	}
	if change.Description != nil {
		updates["description"] = util.ToValue(change.Description)
	}
	if change.Color != nil {
		updates["color"] = change.Color
	}
	if deletedAt != nil {
		updates["deleted_at"] = deletedAt
	}

	// Try update first
	res := tx.Model(&model.Collection{}).
		Where("id = ? AND user_id = ?", change.EntityID, userID).
		Updates(updates)

	if res.Error != nil {
		return res.Error
	}

	// If nothing updated → create
	if res.RowsAffected == 0 {
		collection := &model.Collection{
			ID:          change.EntityID,
			UserID:      userID,
			Title:       util.ToValue(change.Title),
			Description: util.ToValue(change.Description),
			Color:       change.Color,
			DeletedAt:   deletedAt,
		}
		return tx.Create(collection).Error
	}

	return nil
}
