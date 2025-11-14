package controller

import (
	"app/internal/pkg/user/request"
	"app/internal/pkg/user/service"
	"app/internal/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UserController struct {
	UserService  service.UserService
	TokenService service.TokenService
}

func NewUserController(userService service.UserService, tokenService service.TokenService) *UserController {
	return &UserController{
		UserService:  userService,
		TokenService: tokenService,
	}
}

// @Tags         Users
// @Summary      Get all users
// @Description  Only admins can retrieve all users.
// @Security BearerAuth
// @Produce      json
// @Param        page     query     int     false   "Page number"  default(1)
// @Param        limit    query     int     false   "Maximum number of users"    default(10)
// @Param        search   query     string  false  "Search by name or email or role"
// @Router       /users [get]
// @Success      200  {object}  example.GetAllUserResponse
// @Failure      401  {object}  example.Unauthorized  "Unauthorized"
// @Failure      403  {object}  example.Forbidden  "Forbidden"
func (u *UserController) GetUsers(c *fiber.Ctx) error {
	query := &request.QueryUser{
		Page:   c.QueryInt("page", 1),
		Limit:  c.QueryInt("limit", 10),
		Search: c.Query("search", ""),
	}

	users, totalResults, err := u.UserService.GetUsers(c, query)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).
		JSON(utils.ToPaginatedResponse(users, query.Page, query.Limit, totalResults))

}

// @Tags         Users
// @Summary      Get a user
// @Description  Logged in users can fetch only their own user information. Only admins can fetch other users.
// @Security BearerAuth
// @Produce      json
// @Param        id  path  string  true  "User id"
// @Router       /users/{id} [get]
// @Success      200  {object}  example.GetUserResponse
// @Failure      401  {object}  example.Unauthorized  "Unauthorized"
// @Failure      403  {object}  example.Forbidden  "Forbidden"
// @Failure      404  {object}  example.NotFound  "Not found"
func (u *UserController) GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("userId")

	if _, err := uuid.Parse(userID); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid user ID")
	}

	user, err := u.UserService.GetUserByID(c, userID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).
		JSON(utils.ToSuccessResponse(user))
}

// @Tags         Users
// @Summary      Create a user
// @Description  Only admins can create other users.
// @Security BearerAuth
// @Produce      json
// @Param        request  body  validation.CreateUser  true  "Request body"
// @Router       /users [post]
// @Success      201  {object}  example.CreateUserResponse
// @Failure      401  {object}  example.Unauthorized  "Unauthorized"
// @Failure      403  {object}  example.Forbidden  "Forbidden"
// @Failure      409  {object}  example.DuplicateEmail  "Email already taken"
func (u *UserController) CreateUser(c *fiber.Ctx) error {
	req := new(request.CreateUser)

	if err := c.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user, err := u.UserService.CreateUser(c, req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).
		JSON(utils.ToSuccessResponse(user))
}

// @Tags         Users
// @Summary      Update a user
// @Description  Logged in users can only update their own information. Only admins can update other users.
// @Security BearerAuth
// @Produce      json
// @Param        id  path  string  true  "User id"
// @Param        request  body  validation.UpdateUser  true  "Request body"
// @Router       /users/{id} [patch]
// @Success      200  {object}  example.UpdateUserResponse
// @Failure      401  {object}  example.Unauthorized  "Unauthorized"
// @Failure      403  {object}  example.Forbidden  "Forbidden"
// @Failure      404  {object}  example.NotFound  "Not found"
// @Failure      409  {object}  example.DuplicateEmail  "Email already taken"
func (u *UserController) UpdateUser(c *fiber.Ctx) error {
	req := new(request.UpdateUser)
	userID := c.Params("userId")

	if _, err := uuid.Parse(userID); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid user ID")
	}

	if err := c.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user, err := u.UserService.UpdateUser(c, req, userID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).
		JSON(utils.ToSuccessResponse(user))
}

// @Tags         Users
// @Summary      Delete a user
// @Description  Logged in users can delete only themselves. Only admins can delete other users.
// @Security BearerAuth
// @Produce      json
// @Param        id  path  string  true  "User id"
// @Router       /users/{id} [delete]
// @Success      200  {object}  example.DeleteUserResponse
// @Failure      401  {object}  example.Unauthorized  "Unauthorized"
// @Failure      403  {object}  example.Forbidden  "Forbidden"
// @Failure      404  {object}  example.NotFound  "Not found"
func (u *UserController) DeleteUser(c *fiber.Ctx) error {
	userID := c.Params("userId")

	if _, err := uuid.Parse(userID); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid user ID")
	}

	if err := u.TokenService.DeleteAllToken(c, userID); err != nil {
		return err
	}

	if err := u.UserService.DeleteUser(c, userID); err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).
		JSON(utils.ToSuccessResponse(nil))
}
