package model

import "time"

type Chat struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`

	User     *User     `gorm:"foreignKey:UserID"`
	Messages []Message `gorm:"foreignKey:ChatID"`
}
