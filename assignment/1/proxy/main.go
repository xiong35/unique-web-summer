package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"proxy/middleware"
	"proxy/view"

	"github.com/gin-gonic/gin"
)

func main() {
	resp, err := http.Get("https://www.rockstargames.com/newswire/get-posts.json?page=0")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	fmt.Println(string(body))
	fmt.Println(resp.StatusCode)
	if resp.StatusCode == 200 {
		fmt.Println("ok")
	}

	// gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.Use(middleware.Cors())

	router.GET("/rstar", view.ArticleViewPost(""))

	router.Run(":7777")
}
