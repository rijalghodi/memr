package model

import (
	"time"

	"github.com/pgvector/pgvector-go"
)

type Note struct {
	ID           string           `json:"id" gorm:"primaryKey"`
	UserID       string           `json:"user_id"`
	CollectionID *string          `json:"collection_id"`
	Title        string           `json:"title"`
	Content      string           `json:"content"`
	Embedding    *pgvector.Vector `json:"embedding" gorm:"type:vector(1536)"`
	CreatedAt    time.Time        `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt    time.Time        `gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt    *time.Time       `gorm:"index"`

	Collection *Collection `gorm:"foreignKey:CollectionID"`
	User       *User       `gorm:"foreignKey:UserID"`
}
