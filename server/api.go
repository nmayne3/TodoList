package main

/* This file holds all database related fetching and mutation actions*/

import (
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/lib/pq"
)

// Convenience function for easily connecting to DB
func connectToDB() (*sql.DB, error) {
	Config, err := LoadConfig()
	if err != nil {
		fmt.Printf("%s", err.Error())
		return nil, err
	}
	DB := Config.DB
	connString := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", "postgres", 5432, DB.Username, DB.Password, DB.Name)
	db, err := sql.Open("postgres", connString)
	if err == nil {
		fmt.Printf("Connected to database!!!")
	}
	if err != nil {
		fmt.Printf("Fuck my stupid life. Database failed to connect")
		fmt.Printf("%s", err.Error())

	}
	return db, err
}

// GETS all albums from db
func fetchAlbumsDB() []album {
	db, err := connectToDB()
	if err != nil {
		fmt.Printf("%s", err.Error())
		return nil
	}

	// Query the db for the albums table
	var query string = `SELECT * FROM albums`
	rows, err := db.Query(query)
	if err != nil {
		fmt.Printf("%s", err.Error())
		return nil
	}

	// Copies query result into dbAlbum array
	var dbAlbums []album
	for rows.Next() {
		var album album
		err = rows.Scan(&album.ID, &album.Title, &album.Artist, &album.Price)
		dbAlbums = append(dbAlbums, album)
		if err != nil {
			fmt.Printf("%s", err.Error())
			return nil
		}
	}
	db.Close()

	rows.Close()
	return dbAlbums
}

// GETS an album of a given ID
func fetchAlbum(id string) (*album, error) {
	db, err := connectToDB()
	if err != nil {
		fmt.Printf("%s", err.Error())
		return nil, err
	}

	// Query the db for the albums table
	var query string = `SELECT * FROM albums WHERE album_id = ` + id
	rows, err := db.Query(query)
	if err != nil {
		fmt.Printf("%s", err.Error())
		return nil, err
	}

	// Copies query result into dbAlbum array
	rows.Next()
	var album album
	err = rows.Scan(&album.ID, &album.Title, &album.Artist, &album.Price)
	if err != nil {
		fmt.Printf("%s", err.Error())
		return nil, err
	}
	db.Close()
	rows.Close()
	return &album, nil
}

// POSTS a single album, returns error
func PostAlbum(newAlbum *album) error {
	fmt.Printf("creating album?\n")
	db, err := connectToDB()
	if err != nil {
		fmt.Printf("%s", err.Error())
		return err
	}

	row := db.QueryRow("INSERT INTO albums (album_title, artist_name, retail_price) VALUES ($1, $2, $3) RETURNING album_id", newAlbum.Title, newAlbum.Artist, newAlbum.Price)

	nerr := row.Scan(&newAlbum.ID)

	fmt.Printf("album created\n")
	db.Close()

	return nerr
}

// DELETES albums of given ids.
// @param id - a string which contains ids (separated by commas) of the albums wished to be deleted.
// i.e. "1,4,5,...,2"
func DeleteAlbumFromDB(id string) (sql.Result, error) {
	db, err := connectToDB()
	if err != nil {
		fmt.Printf("%s", err.Error())
		return nil, err
	}
	queryString := fmt.Sprintf("DELETE FROM albums WHERE album_id IN (%s)", id)

	delete, err := db.Prepare(queryString)

	if err != nil {
		fmt.Printf("delete request failed to prepare")
		return nil, err
	}
	id = strings.ReplaceAll(id, ",", ", ")
	fmt.Printf("ID's: %s\n", id)
	result, err := delete.Exec()

	fmt.Printf("album deleted")
	db.Close()
	delete.Close()
	return result, err
}
