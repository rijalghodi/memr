package model

import "time"

type Message struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	ChatID    string    `json:"chat_id"`
	UserID    string    `json:"user_id"`
	Role      string    `json:"role" gorm:"type:text;check:role IN ('user','assistant','system','tool')"`
	Content   *string   `json:"content"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`

	Chat      *Chat      `gorm:"foreignKey:ChatID"`
	User      *User      `gorm:"foreignKey:UserID"`
	ToolCalls []ToolCall `gorm:"foreignKey:MessageID"`
}
