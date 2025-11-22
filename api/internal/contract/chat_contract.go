package contract

type ChatStartReq struct {
	// user_id will be extracted from JWT claims, not from request body
}

type ChatStartRes struct {
	ChatID string `json:"chatId"`
}

type ChatSendReq struct {
	ChatID  string `json:"chatId" validate:"required,uuid"`
	Message string `json:"message" validate:"required"`
	// user_id will be extracted from JWT claims, not from request body
}

type ChatSendRes struct {
	AssistantMessage string `json:"assistantMessage"`
}

type ChatHistoryRes struct {
	Messages []MessageRes `json:"messages"`
}

type MessageRes struct {
	ID        string        `json:"id"`
	Role      string        `json:"role"`
	Content   *string       `json:"content"`
	CreatedAt string        `json:"createdAt"`
	ToolCalls []ToolCallRes `json:"toolCalls,omitempty"`
}

type ToolCallRes struct {
	ID        string         `json:"id"`
	Name      *string        `json:"name"`
	Arguments map[string]any `json:"arguments"`
	CreatedAt string         `json:"createdAt"`
}
