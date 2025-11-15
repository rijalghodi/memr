package contract

type UserRes struct {
	ID         string `json:"id"`
	Email      string `json:"email"`
	Name       string `json:"name"`
	IsVerified bool   `json:"isVerified"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

type GoogleOAuthReq struct {
	IDToken string `json:"idToken" validate:"required"`
}

type GoogleOAuthRes struct {
	AccessToken          string `json:"accessToken"`
	AccessTokenExpiresAt string `json:"accessTokenExpiresAt"`
	UserRes
}
