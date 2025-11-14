package utils

type BaseResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
	Details any    `json:"details,omitempty"`
}

func ToSuccessResponse(data any) BaseResponse {
	return BaseResponse{Status: true, Message: "success", Data: data}
}

func ToErrorResponse(msg string, details any) BaseResponse {
	return BaseResponse{Status: false, Message: msg, Details: details}
}

type PaginatedData struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	Items      any   `json:"items"`
}

type PaginatedResponse struct {
	Status  bool          `json:"status"`
	Message string        `json:"message"`
	Data    PaginatedData `json:"data"`
}

func ToPaginatedResponse(items any, page, pageSize int, total int64) PaginatedResponse {
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return PaginatedResponse{
		Status:  true,
		Message: "success",
		Data: PaginatedData{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
			Items:      items,
		},
	}
}
