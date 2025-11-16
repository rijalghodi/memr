package model

import "time"

type Note struct {
	ID           string     `json:"id"`
	CollectionID *string    `json:"collection_id"`
	Title        string     `json:"title"`
	Content      string     `json:"content"`
	Embedding    []float32  `json:"embedding" gorm:"type:vector(1536)"`
	CreatedAt    time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt    time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt    *time.Time `gorm:"index"`

	Collection *Collection `gorm:"foreignKey:CollectionID"`
}
