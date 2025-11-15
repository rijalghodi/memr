package usecase

import "github.com/gofiber/fiber/v2"

type HelloUsecase struct{}

func NewHelloUsecase() *HelloUsecase {
	return &HelloUsecase{}
}

func (u *HelloUsecase) Hello(c *fiber.Ctx) error {
	return c.SendString("Hello, World!")
}
