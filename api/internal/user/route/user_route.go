package router

import (
	"app/internal/middleware"
	"app/internal/pkg/user/controller"
	"app/internal/pkg/user/service"

	"github.com/gofiber/fiber/v2"
)

func UserRoutes(v1 fiber.Router, u service.UserService, t service.TokenService) {
	userController := controller.NewUserController(u, t)

	user := v1.Group("/users")

	user.Get("/", middleware.Auth(u, "getUsers"), userController.GetUsers)
	user.Post("/", middleware.Auth(u, "manageUsers"), userController.CreateUser)
	user.Get("/:userId", middleware.Auth(u, "getUsers"), userController.GetUserByID)
	user.Patch("/:userId", middleware.Auth(u, "manageUsers"), userController.UpdateUser)
	user.Delete("/:userId", middleware.Auth(u, "manageUsers"), userController.DeleteUser)
}
