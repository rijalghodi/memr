package example

type SuccessWithTokens struct {
	Code    int    `json:"code" example:"201"`
	Status  string `json:"status" example:"success"`
	Message string `json:"message" example:"Register successfully"`
	User    User   `json:"user"`
	Tokens  Tokens `json:"tokens"`
}
