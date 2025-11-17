package contract

type SyncReq struct {
	Changes      []Change `json:"changes" validate:"dive"`
	LastSyncTime string   `json:"lastSyncTime"`
}

type SyncRes struct {
	Changes      []Change `json:"changes"`
	LastSyncTime string   `json:"lastSyncTime"`
}

type Change struct {
	Type        string  `json:"type" validate:"required,oneof=task project note collection"`
	ID          string  `json:"id" validate:"required,uuid"`
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`

	// Task-only
	ProjectID *string `json:"projectId,omitempty" validate:"omitempty,uuid"`
	SortOrder *string `json:"sortOrder,omitempty"`
	DueDate   *string `json:"dueDate,omitempty"`
	Status    *int    `json:"status,omitempty"`
	Content   *string `json:"content,omitempty"`

	// Project and collection-only
	Color *string `json:"color,omitempty"`

	// Note-only
	CollectionID *string `json:"collectionId,omitempty" validate:"omitempty,uuid"`

	UpdatedAt string  `json:"updatedAt"`
	CreatedAt string  `json:"createdAt"`
	DeletedAt *string `json:"deletedAt,omitempty"`
}
