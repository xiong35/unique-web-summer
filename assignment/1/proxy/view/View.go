package view

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ArticleViewPost handle post requests for articles
func ArticleViewPost(t string) func(c *gin.Context) {

	return func(c *gin.Context) {
		// var articleHandler handlers.Article
		var err error
		var id uint

		// err = c.ShouldBindBodyWith(&articleHandler, binding.JSON)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// id, err = articleHandler.Insert(t)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"status":  http.StatusInternalServerError,
				"message": "Insert() error!",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status": http.StatusOK,
			"id":     id,
		})
	}
}
