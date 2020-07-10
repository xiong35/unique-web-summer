package main

import (
	"proxy/middleware"
	"proxy/view"

	"github.com/gin-gonic/gin"
)

func main() {

	// gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.Use(middleware.Cors())

	router.GET("/rstar/games", view.GetGames())
	router.GET("/rstar/posts", view.GetPosts())

	router.Run(":7777")
}
