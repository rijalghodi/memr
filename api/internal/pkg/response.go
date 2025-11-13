package pkg

import (
	"github.com/gofiber/fiber/v2"
)

// SuccessResponse represents a successful API response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorResponse represents an error API response
type ErrorResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Error   interface{} `json:"error,omitempty"`
}

// SendSuccess sends a successful response
func SendSuccess(c *fiber.Ctx, message string, data interface{}) error {
	return c.Status(fiber.StatusOK).JSON(SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// SendCreated sends a created response
func SendCreated(c *fiber.Ctx, message string, data interface{}) error {
	return c.Status(fiber.StatusCreated).JSON(SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// SendError sends an error response
func SendError(c *fiber.Ctx, statusCode int, message string, err interface{}) error {
	return c.Status(statusCode).JSON(ErrorResponse{
		Success: false,
		Message: message,
		Error:   err,
	})
}

// SendBadRequest sends a bad request error response
func SendBadRequest(c *fiber.Ctx, message string, err interface{}) error {
	return SendError(c, fiber.StatusBadRequest, message, err)
}

// SendUnauthorized sends an unauthorized error response
func SendUnauthorized(c *fiber.Ctx, message string) error {
	return SendError(c, fiber.StatusUnauthorized, message, nil)
}

// SendForbidden sends a forbidden error response
func SendForbidden(c *fiber.Ctx, message string) error {
	return SendError(c, fiber.StatusForbidden, message, nil)
}

// SendNotFound sends a not found error response
func SendNotFound(c *fiber.Ctx, message string) error {
	return SendError(c, fiber.StatusNotFound, message, nil)
}

// SendInternalError sends an internal server error response
func SendInternalError(c *fiber.Ctx, message string, err interface{}) error {
	return SendError(c, fiber.StatusInternalServerError, message, err)
}


