package model

import (
	"time"

	"gorm.io/datatypes"
)

type ToolCall struct {
	ID        string         `json:"id" gorm:"primaryKey"`
	MessageID string         `json:"message_id"`
	Name      *string        `json:"name"`
	Arguments datatypes.JSON `json:"arguments" gorm:"type:jsonb"`
	CreatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP"`

	Message *Message `gorm:"foreignKey:MessageID"`
}

// GetArgumentsBytes returns Arguments as []byte
func (t ToolCall) GetArgumentsBytes() []byte {
	return []byte(t.Arguments)
}
