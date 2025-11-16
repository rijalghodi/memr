package model

import "time"

type Task struct {
	ID          string     `json:"id"`
	ProjectID   *string    `json:"project_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      int        `json:"status"`
	SortOrder   *string    `json:"sort_order"`
	DueDate     *time.Time `json:"due_date"`
	CreatedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt   *time.Time `gorm:"index"`

	Project *Project `gorm:"foreignKey:ProjectID"`
}
