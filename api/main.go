package main

import (
	"app/cmd"
	"log"
)

// @title Memr API
// @version 1.0.0
// @description Second brain that understand you. Manage project, todo, and resources in single app.
// @contact.name Rijal Ghodi
// @contact.email rijalghodi.dev@gmail.com
// @license.name MIT
// @host localhost:3000
// @BasePath /v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Example Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
func main() {
	if err := cmd.Execute(); err != nil {
		log.Fatalf("Could not execute command!, err: %s", err.Error())
	}
}
