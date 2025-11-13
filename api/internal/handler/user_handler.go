package handler

import (
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/rijalghodi/memr/api/internal/contract"
	"github.com/rijalghodi/memr/api/internal/domain"
	"github.com/rijalghodi/memr/api/internal/pkg"
)

// UserHandler handles HTTP requests for user operations
type UserHandler struct {
	userUseCase contract.UserUseCase
	validator   *validator.Validate
}

// NewUserHandler creates a new user handler instance
func NewUserHandler(userUseCase contract.UserUseCase) *UserHandler {
	return &UserHandler{
		userUseCase: userUseCase,
		validator:   validator.New(),
	}
}

// CreateUser godoc
// @Summary Create a new user
// @Description Create a new user with name, email, and password
// @Tags users
// @Accept json
// @Produce json
// @Param user body domain.CreateUserRequest true "User creation request"
// @Success 201 {object} pkg.SuccessResponse{data=domain.UserResponse}
// @Failure 400 {object} pkg.ErrorResponse
// @Failure 500 {object} pkg.ErrorResponse
// @Router /users [post]
func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var req domain.CreateUserRequest

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return pkg.SendBadRequest(c, "Invalid request body", err.Error())
	}

	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		return pkg.SendBadRequest(c, "Validation failed", err.Error())
	}

	// Create user
	user, err := h.userUseCase.CreateUser(c.Context(), &req)
	if err != nil {
		return pkg.SendInternalError(c, "Failed to create user", err.Error())
	}

	return pkg.SendCreated(c, "User created successfully", user)
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Get a user by their ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} pkg.SuccessResponse{data=domain.UserResponse}
// @Failure 400 {object} pkg.ErrorResponse
// @Failure 404 {object} pkg.ErrorResponse
// @Failure 500 {object} pkg.ErrorResponse
// @Router /users/{id} [get]
func (h *UserHandler) GetUserByID(c *fiber.Ctx) error {
	// Parse ID from path parameter
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return pkg.SendBadRequest(c, "Invalid user ID", err.Error())
	}

	// Get user
	user, err := h.userUseCase.GetUserByID(c.Context(), uint(id))
	if err != nil {
		return pkg.SendNotFound(c, err.Error())
	}

	return pkg.SendSuccess(c, "User retrieved successfully", user)
}

// GetAllUsers godoc
// @Summary Get all users
// @Description Get a list of all users
// @Tags users
// @Accept json
// @Produce json
// @Success 200 {object} pkg.SuccessResponse{data=[]domain.UserResponse}
// @Failure 500 {object} pkg.ErrorResponse
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *fiber.Ctx) error {
	// Get all users
	users, err := h.userUseCase.GetAllUsers(c.Context())
	if err != nil {
		return pkg.SendInternalError(c, "Failed to retrieve users", err.Error())
	}

	return pkg.SendSuccess(c, "Users retrieved successfully", users)
}

// UpdateUser godoc
// @Summary Update user
// @Description Update a user's information
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body domain.UpdateUserRequest true "User update request"
// @Success 200 {object} pkg.SuccessResponse{data=domain.UserResponse}
// @Failure 400 {object} pkg.ErrorResponse
// @Failure 404 {object} pkg.ErrorResponse
// @Failure 500 {object} pkg.ErrorResponse
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	// Parse ID from path parameter
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return pkg.SendBadRequest(c, "Invalid user ID", err.Error())
	}

	var req domain.UpdateUserRequest

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return pkg.SendBadRequest(c, "Invalid request body", err.Error())
	}

	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		return pkg.SendBadRequest(c, "Validation failed", err.Error())
	}

	// Update user
	user, err := h.userUseCase.UpdateUser(c.Context(), uint(id), &req)
	if err != nil {
		return pkg.SendInternalError(c, "Failed to update user", err.Error())
	}

	return pkg.SendSuccess(c, "User updated successfully", user)
}

// DeleteUser godoc
// @Summary Delete user
// @Description Delete a user by ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} pkg.SuccessResponse
// @Failure 400 {object} pkg.ErrorResponse
// @Failure 404 {object} pkg.ErrorResponse
// @Failure 500 {object} pkg.ErrorResponse
// @Router /users/{id} [delete]
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	// Parse ID from path parameter
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return pkg.SendBadRequest(c, "Invalid user ID", err.Error())
	}

	// Delete user
	if err := h.userUseCase.DeleteUser(c.Context(), uint(id)); err != nil {
		return pkg.SendInternalError(c, "Failed to delete user", err.Error())
	}

	return pkg.SendSuccess(c, "User deleted successfully", nil)
}

// Login godoc
// @Summary User login
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body domain.LoginRequest true "Login credentials"
// @Success 200 {object} pkg.SuccessResponse{data=domain.LoginResponse}
// @Failure 400 {object} pkg.ErrorResponse
// @Failure 401 {object} pkg.ErrorResponse
// @Failure 500 {object} pkg.ErrorResponse
// @Router /auth/login [post]
func (h *UserHandler) Login(c *fiber.Ctx) error {
	var req domain.LoginRequest

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return pkg.SendBadRequest(c, "Invalid request body", err.Error())
	}

	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		return pkg.SendBadRequest(c, "Validation failed", err.Error())
	}

	// Login
	response, err := h.userUseCase.Login(c.Context(), &req)
	if err != nil {
		return pkg.SendUnauthorized(c, err.Error())
	}

	return pkg.SendSuccess(c, "Login successful", response)
}


