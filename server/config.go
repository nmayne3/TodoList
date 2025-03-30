package main

import (
	"errors"

	"os"
)

type Config struct {
	DB PostgresConfig
}

type PostgresConfig struct {
	Username string
	Password string
	Name     string
}

func LoadConfig() (*Config, error) {
	cfg := &Config{
		DB: PostgresConfig{
			Username: os.Getenv("POSTGRES_USER"),
			Password: os.Getenv("POSTGRES_PW"),
			Name:     os.Getenv("POSTGRES_DB"),
		},
	}

	if cfg.DB.Username == "" {
		return nil, errors.New("username is empty\nensure that '.env' is loading correctly")
	}

	return cfg, nil
}
