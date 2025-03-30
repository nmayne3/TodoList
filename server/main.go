package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// album represents data about a record album.
type album struct {
	ID     string  `json:"album_id"`
	Title  string  `json:"album_title"`
	Artist string  `json:"artist_name"`
	Price  float64 `json:"retail_price"`
}

// Sets up our endpoints and begins listening on port 8080
func main() {
	router := gin.Default()
	router.GET("/albums", getAlbums)
	router.GET("/albums/:id", getAlbumByID)
	router.POST("/albums", postAlbums)
	router.DELETE("/albums/:id", deleteAlbum)
	router.DELETE("/albums", deleteAlbum)

	router.Run()
}

// getAlbums responds with the list of all albums as JSON.
func getAlbums(c *gin.Context) {
	fmt.Printf("Get albums endpoint accessed\n")
	redisClient := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	// Try fetching albums from cache
	cachedAlbums, err := redisClient.Get(c, "products").Bytes()

	// Albums not in cache
	if err != nil {
		// Fetch from db instead
		dbAlumbs := fetchAlbumsDB()
		c.IndentedJSON(http.StatusOK, dbAlumbs)
		return
	}

	c.IndentedJSON(http.StatusOK, cachedAlbums)
}

// postAlbums adds an album from JSON received in the request body.
func postAlbums(c *gin.Context) {
	var newAlbum album

	// Call BindJSON to bind the received JSON to
	// newAlbum.
	if err := c.BindJSON(&newAlbum); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "bad request"})
		return
	}

	// Add the new album to the slice.

	PostAlbum(&newAlbum)
	c.IndentedJSON(http.StatusCreated, newAlbum)
}

// Endpoint for deleting albums.
// It has one param: id - a string of ids of albums to be deleted
func deleteAlbum(c *gin.Context) {
	id := c.Param("id")

	_, err := DeleteAlbumFromDB(id)

	if err != nil {

		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

}

// getAlbumByID locates the album whose ID value matches the id
// parameter sent by the client, then returns that album as a response.
func getAlbumByID(c *gin.Context) {
	id := c.Param("id")

	// Loop through the list of albums, looking for
	// an album whose ID value matches the parameter.
	album, err := fetchAlbum(id)
	if err != nil {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album not found"})
		return
	}
	c.IndentedJSON(http.StatusOK, album)
}
