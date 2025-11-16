package contract

type UserRes struct {
	ID         string `json:"id"`
	Email      string `json:"email"`
	Name       string `json:"name"`
	Role       string `json:"role"`
	IsVerified bool   `json:"isVerified"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

type TokenRes struct {
	AccessToken           string `json:"accessToken"`
	AccessTokenExpiresAt  string `json:"accessTokenExpiresAt"`
	RefreshToken          string `json:"refreshToken"`
	RefreshTokenExpiresAt string `json:"refreshTokenExpiresAt"`
}

type GoogleOAuthReq struct {
	IDToken string `json:"idToken" validate:"required"`
}

type GoogleOAuthRes struct {
	TokenRes
	UserRes
}

type RefreshTokenReq struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type RefreshTokenRes struct {
	TokenRes
	UserRes
}
