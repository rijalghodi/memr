package contract

type SyncReq struct {
	Changes      []Change `json:"changes"`
	LastSyncTime string   `json:"lastSyncTime"`
}

type SyncRes struct {
	Changes      []Change `json:"changes"`
	LastSyncTime string   `json:"lastSyncTime"`
}

type Change struct {
	Type        string  `json:"type"` // "task" or "project" or "note" or "collection"
	ID          string  `json:"id" validate:"required"`
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`

	// Task-only
	ProjectID *string `json:"projectId,omitempty"`
	SortOrder *string `json:"sortOrder,omitempty"`
	DueDate   *string `json:"dueDate,omitempty"`
	Status    *int    `json:"status,omitempty"`
	Content   *string `json:"content,omitempty"`

	// Project and collection-only
	Color *string `json:"color,omitempty"`

	// Note-only
	CollectionID *string `json:"collectionId,omitempty"`

	UpdatedAt string  `json:"updatedAt"`
	CreatedAt string  `json:"createdAt"`
	DeletedAt *string `json:"deletedAt,omitempty"`
}
