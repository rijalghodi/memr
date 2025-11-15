package handler

import (
	"app/internal/usecase"

	"github.com/gofiber/fiber/v2"
)

type HelloHandler struct {
	helloUsecase *usecase.HelloUsecase
}

func NewHelloHandler(helloUsecase *usecase.HelloUsecase) *HelloHandler {
	return &HelloHandler{helloUsecase: helloUsecase}
}

func (h *HelloHandler) RegisterRoutes(app *fiber.App) {
	app.Get("/hello", h.Hello)
}

func (h *HelloHandler) Hello(c *fiber.Ctx) error {
	return h.helloUsecase.Hello(c)
}
