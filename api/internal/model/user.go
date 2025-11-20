package model

import "time"

type User struct {
	ID         string     `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Name       string     `json:"name"`
	Email      string     `json:"email"`
	IsVerified bool       `json:"is_verified"`
	GoogleID   *string    `json:"google_id"`
	CreatedAt  time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt  *time.Time `gorm:"index"`
}
