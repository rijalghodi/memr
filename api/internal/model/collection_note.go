package model

type CollectionNote struct {
	CollectionID string `json:"collection_id"`
	NoteID       string `json:"note_id"`

	Collection Collection `gorm:"foreignKey:CollectionID"`
	Note       Note       `gorm:"foreignKey:NoteID"`
}
