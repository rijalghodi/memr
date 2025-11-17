package model

import "time"

type Project struct {
	ID          string     `json:"id" gorm:"primaryKey"`
	UserID      string     `json:"user_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Color       *string    `json:"color"`
	CreatedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt   *time.Time `gorm:"index"`

	User *User `gorm:"foreignKey:UserID"`
}
