package view

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetGames handle post requests for articles
func GetGames() func(c *gin.Context) {

	return func(c *gin.Context) {

		resp, err := http.Get("https://www.rockstargames.com/games/get-games.json")
		if err != nil {
			fmt.Println(err)
			return
		}
		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)

		if err == nil {
			c.JSON(http.StatusOK, gin.H{
				"status": resp.StatusCode,
				"data":   string(body),
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
}

// GetPosts handle post requests for articles
func GetPosts() func(c *gin.Context) {

	return func(c *gin.Context) {

		page := c.Query("page")
		url := "https://www.rockstargames.com/newswire/get-posts.json?page=" + page

		resp, err := http.Get(url)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)

		if err == nil {
			c.JSON(http.StatusOK, gin.H{
				"status": resp.StatusCode,
				"data":   string(body),
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
}
