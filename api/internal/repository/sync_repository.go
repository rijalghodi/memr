package repository

import (
	"app/internal/contract"
	"app/internal/model"
	"app/pkg/logger"
	"app/pkg/util"
	"sort"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SyncRepository struct {
	db *gorm.DB
}

func NewSyncRepository(db *gorm.DB) *SyncRepository {
	return &SyncRepository{db: db}
}

func (r *SyncRepository) GetChanges(userID string, from string) (changes []contract.Change, err error) {

	var tasks []model.Task
	var projects []model.Project
	var notes []model.Note
	var collections []model.Collection

	err = r.db.Where("user_id = ? AND updated_at > ?", userID, from).Order("updated_at ASC").Find(&tasks).Error
	if err != nil {
		return nil, err
	}
	err = r.db.Where("user_id = ? AND updated_at > ?", userID, from).Order("updated_at ASC").Find(&projects).Error
	if err != nil {
		return nil, err
	}
	err = r.db.Where("user_id = ? AND updated_at > ?", userID, from).Order("updated_at ASC").Find(&notes).Error
	if err != nil {
		return nil, err
	}
	err = r.db.Where("user_id = ? AND updated_at > ?", userID, from).Order("updated_at ASC").Find(&collections).Error
	if err != nil {
		return nil, err
	}

	changes = make([]contract.Change, len(tasks)+len(projects)+len(notes)+len(collections))

	for _, task := range tasks {
		changes = append(changes, contract.Change{
			Type:        "task",
			ID:          task.ID,
			Title:       util.ToPointer(task.Title),
			Description: util.ToPointer(task.Description),
			ProjectID:   task.ProjectID,
			SortOrder:   task.SortOrder,
			DueDate:     util.ToPointer(task.DueDate.Format(time.RFC3339)),
			Status:      util.ToPointer(task.Status),
			UpdatedAt:   task.UpdatedAt.Format(time.RFC3339),
			CreatedAt:   task.CreatedAt.Format(time.RFC3339),
			DeletedAt:   util.ToPointer(task.DeletedAt.Format(time.RFC3339)),
		})
	}

	for _, project := range projects {
		changes = append(changes, contract.Change{
			Type:        "project",
			ID:          project.ID,
			Title:       util.ToPointer(project.Title),
			Description: util.ToPointer(project.Description),
			Color:       project.Color,
			UpdatedAt:   project.UpdatedAt.Format(time.RFC3339),
			CreatedAt:   project.CreatedAt.Format(time.RFC3339),
			DeletedAt:   util.ToPointer(project.DeletedAt.Format(time.RFC3339)),
		})
	}

	for _, note := range notes {
		changes = append(changes, contract.Change{
			Type:         "note",
			ID:           note.ID,
			CollectionID: note.CollectionID,
			Title:        util.ToPointer(note.Title),
			Content:      util.ToPointer(note.Content),
			UpdatedAt:    note.UpdatedAt.Format(time.RFC3339),
			CreatedAt:    note.CreatedAt.Format(time.RFC3339),
			DeletedAt:    util.ToPointer(note.DeletedAt.Format(time.RFC3339)),
		})
	}

	for _, collection := range collections {
		changes = append(changes, contract.Change{
			Type:        "collection",
			ID:          collection.ID,
			Title:       util.ToPointer(collection.Title),
			Description: util.ToPointer(collection.Description),
			Color:       collection.Color,
			UpdatedAt:   collection.UpdatedAt.Format(time.RFC3339),
			CreatedAt:   collection.CreatedAt.Format(time.RFC3339),
			DeletedAt:   util.ToPointer(collection.DeletedAt.Format(time.RFC3339)),
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
			err = r.syncTask(tx, &change)
			if err != nil {
				tx.Rollback()
				return lastSyncTime, changes, err
			}
		case "project":
			err = r.syncProject(tx, userID, &change)
			if err != nil {
				tx.Rollback()
				return lastSyncTime, changes, err
			}
		case "note":
			err = r.syncNote(tx, &change)
			if err != nil {
				tx.Rollback()
				return lastSyncTime, changes, err
			}
		case "collection":
			err = r.syncCollection(tx, userID, &change)
			if err != nil {
				tx.Rollback()
				return lastSyncTime, changes, err
			}
		}
	}

	if err = tx.Commit().Error; err != nil {
		return lastSyncTime, changes, err
	}
	lastSyncTime = time.Now()

	changes, err = r.GetChanges(userID, req.LastSyncTime)
	if err != nil {
		return lastSyncTime, changes, err
	}

	return lastSyncTime, changes, nil
}

func (r *SyncRepository) syncTask(tx *gorm.DB, change *contract.Change) error {
	var dueDate *time.Time
	if change.DueDate != nil {
		dueDateTime, err := time.Parse(time.RFC3339, util.ToValue(change.DueDate))
		if err != nil {
			logger.Log.Warn("Failed to parse due date", zap.Error(err), zap.String("dueDate", util.ToValue(change.DueDate)))
			return err
		}
		dueDate = util.ToPointer(dueDateTime)
	}

	var status int
	if change.Status != nil {
		status = *change.Status
	}

	task := &model.Task{
		ID:          change.ID,
		ProjectID:   change.ProjectID,
		Title:       util.ToValue(change.Title),
		Description: util.ToValue(change.Description),
		Status:      status,
		SortOrder:   change.SortOrder,
		DueDate:     dueDate,
	}
	return tx.Model(&model.Task{}).Save(task).Error
}

func (r *SyncRepository) syncProject(tx *gorm.DB, userID string, change *contract.Change) error {
	project := &model.Project{
		ID:          change.ID,
		UserID:      userID,
		Title:       util.ToValue(change.Title),
		Description: util.ToValue(change.Description),
		Color:       change.Color,
	}
	return tx.Model(&model.Project{}).Save(project).Error
}

func (r *SyncRepository) syncNote(tx *gorm.DB, change *contract.Change) error {
	note := &model.Note{
		ID:           change.ID,
		CollectionID: change.CollectionID,
		Title:        util.ToValue(change.Title),
		Content:      util.ToValue(change.Content),
	}
	return tx.Model(&model.Note{}).Save(note).Error
}

func (r *SyncRepository) syncCollection(tx *gorm.DB, userID string, change *contract.Change) error {
	collection := &model.Collection{
		ID:          change.ID,
		UserID:      userID,
		Title:       util.ToValue(change.Title),
		Description: util.ToValue(change.Description),
		Color:       change.Color,
	}
	return tx.Model(&model.Collection{}).Save(collection).Error
}
