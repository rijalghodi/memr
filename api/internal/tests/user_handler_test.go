package tests

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/rijalghodi/memr/api/internal/domain"
	"github.com/rijalghodi/memr/api/internal/handler"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserUseCase is a mock implementation of UserUseCase interface
type MockUserUseCase struct {
	mock.Mock
}

func (m *MockUserUseCase) CreateUser(ctx interface{}, req *domain.CreateUserRequest) (*domain.UserResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.UserResponse), args.Error(1)
}

func (m *MockUserUseCase) GetUserByID(ctx interface{}, id uint) (*domain.UserResponse, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.UserResponse), args.Error(1)
}

func (m *MockUserUseCase) GetAllUsers(ctx interface{}) ([]domain.UserResponse, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.UserResponse), args.Error(1)
}

func (m *MockUserUseCase) UpdateUser(ctx interface{}, id uint, req *domain.UpdateUserRequest) (*domain.UserResponse, error) {
	args := m.Called(ctx, id, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.UserResponse), args.Error(1)
}

func (m *MockUserUseCase) DeleteUser(ctx interface{}, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserUseCase) Login(ctx interface{}, req *domain.LoginRequest) (*domain.LoginResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.LoginResponse), args.Error(1)
}

func TestCreateUser_Success(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Mock response
	expectedUser := &domain.UserResponse{
		ID:    1,
		Name:  "John Doe",
		Email: "john@example.com",
	}

	// Setup expectations
	mockUseCase.On("CreateUser", mock.Anything, mock.Anything).Return(expectedUser, nil)

	// Setup route
	app.Post("/users", userHandler.CreateUser)

	// Create request
	reqBody := domain.CreateUserRequest{
		Name:     "John Doe",
		Email:    "john@example.com",
		Password: "password123",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/users", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 201, resp.StatusCode)
	mockUseCase.AssertExpectations(t)
}

func TestCreateUser_ValidationError(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Setup route
	app.Post("/users", userHandler.CreateUser)

	// Create invalid request (missing required fields)
	reqBody := domain.CreateUserRequest{
		Name: "Jo", // Too short (min 3)
	}
	bodyBytes, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/users", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 400, resp.StatusCode)
}

func TestGetUserByID_Success(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Mock response
	expectedUser := &domain.UserResponse{
		ID:    1,
		Name:  "John Doe",
		Email: "john@example.com",
	}

	// Setup expectations
	mockUseCase.On("GetUserByID", mock.Anything, uint(1)).Return(expectedUser, nil)

	// Setup route
	app.Get("/users/:id", userHandler.GetUserByID)

	// Create request
	req := httptest.NewRequest("GET", "/users/1", nil)

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
	mockUseCase.AssertExpectations(t)
}

func TestGetUserByID_NotFound(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Setup expectations
	mockUseCase.On("GetUserByID", mock.Anything, uint(999)).Return(nil, errors.New("user not found"))

	// Setup route
	app.Get("/users/:id", userHandler.GetUserByID)

	// Create request
	req := httptest.NewRequest("GET", "/users/999", nil)

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 404, resp.StatusCode)
	mockUseCase.AssertExpectations(t)
}

func TestGetAllUsers_Success(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Mock response
	expectedUsers := []domain.UserResponse{
		{ID: 1, Name: "John Doe", Email: "john@example.com"},
		{ID: 2, Name: "Jane Smith", Email: "jane@example.com"},
	}

	// Setup expectations
	mockUseCase.On("GetAllUsers", mock.Anything).Return(expectedUsers, nil)

	// Setup route
	app.Get("/users", userHandler.GetAllUsers)

	// Create request
	req := httptest.NewRequest("GET", "/users", nil)

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
	mockUseCase.AssertExpectations(t)
}

func TestUpdateUser_Success(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Mock response
	expectedUser := &domain.UserResponse{
		ID:    1,
		Name:  "John Updated",
		Email: "john@example.com",
	}

	// Setup expectations
	mockUseCase.On("UpdateUser", mock.Anything, uint(1), mock.Anything).Return(expectedUser, nil)

	// Setup route
	app.Put("/users/:id", userHandler.UpdateUser)

	// Create request
	reqBody := domain.UpdateUserRequest{
		Name: "John Updated",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("PUT", "/users/1", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
	mockUseCase.AssertExpectations(t)
}

func TestDeleteUser_Success(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Setup expectations
	mockUseCase.On("DeleteUser", mock.Anything, uint(1)).Return(nil)

	// Setup route
	app.Delete("/users/:id", userHandler.DeleteUser)

	// Create request
	req := httptest.NewRequest("DELETE", "/users/1", nil)

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
	mockUseCase.AssertExpectations(t)
}

func TestLogin_Success(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Mock response
	expectedResponse := &domain.LoginResponse{
		Token: "mock-jwt-token",
		User: &domain.UserResponse{
			ID:    1,
			Name:  "John Doe",
			Email: "john@example.com",
		},
	}

	// Setup expectations
	mockUseCase.On("Login", mock.Anything, mock.Anything).Return(expectedResponse, nil)

	// Setup route
	app.Post("/auth/login", userHandler.Login)

	// Create request
	reqBody := domain.LoginRequest{
		Email:    "john@example.com",
		Password: "password123",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/auth/login", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
	mockUseCase.AssertExpectations(t)
}

func TestLogin_InvalidCredentials(t *testing.T) {
	// Setup
	app := fiber.New()
	mockUseCase := new(MockUserUseCase)
	userHandler := handler.NewUserHandler(mockUseCase)

	// Setup expectations
	mockUseCase.On("Login", mock.Anything, mock.Anything).Return(nil, errors.New("invalid email or password"))

	// Setup route
	app.Post("/auth/login", userHandler.Login)

	// Create request
	reqBody := domain.LoginRequest{
		Email:    "wrong@example.com",
		Password: "wrongpassword",
	}
	bodyBytes, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/auth/login", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	// Execute
	resp, err := app.Test(req)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 401, resp.StatusCode)
	mockUseCase.AssertExpectations(t)
}


