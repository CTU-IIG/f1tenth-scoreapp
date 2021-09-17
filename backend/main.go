package main

import (
	"encoding/json"
	//"fmt"
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"math/rand"
)

type CommonModelFields struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"-"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Team struct {
	CommonModelFields
	Name   string  `gorm:"uniqueIndex" json:"name"`
	Trials []Trial `json:"-"`
}

type Trial struct {
	CommonModelFields
	TeamID    uint       `json:"-"`
	Team      Team       `json:"team"`
	Round     uint32     `json:"round"`
	Crossings []Crossing `json:"crossings"`
}

type Crossing struct {
	ID      uint `gorm:"primaryKey" json:"id"`
	Time    Time `json:"time"`
	Ignored bool `json:"ignored"`
	TrialID uint `json:"-"`
}

var (
	db *gorm.DB
)

func getTrial(c echo.Context) error {
	var trial *Trial
	if err := db.Preload("Team").Preload("Crossings").First(&trial, c.Param("id")).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, *trial)
}

func initDb() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("scoreapp.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	db.AutoMigrate(&Team{}, &Trial{}, &Crossing{})

	// Create objects for testing
	var count int64

	var team Team
	db.FirstOrCreate(&team, Team{Name: "Ředkvičky"})

	db.Model(&Trial{}).Count(&count)
	for round := 1; round <= 2; round++ {
		var trial Trial
		db.FirstOrCreate(&trial, &Trial{TeamID: team.ID, Round: uint32(round)})
		if round == 1 {
			db.Model(&trial).Association("Crossings").Append(&Crossing{Time: Time(time.Now().Add(-12 * time.Second)), Ignored: false})
			db.Model(&trial).Association("Crossings").Append(&Crossing{Time: Time(time.Now()), Ignored: false})
		}
	}
	return db

}

func barrierSimulator(hub *Hub, db *gorm.DB) {
	var trial Trial
	db.Model(&Trial{}).Preload("Crossings").Preload("Team").First(&trial, 1)
	time.Sleep(1 * time.Second)
	for {
		log.Printf("New crossing")
		db.Model(&trial).Association("Crossings").Append(&Crossing{Time: Time(time.Now()), Ignored: false})
		type Message struct {
			Trial *Trial `json:"trial"`
		}

		b, err := json.Marshal(&Message{&trial})
		if err != nil {
			log.Fatal(err)
		}
		hub.broadcast <- b

		time.Sleep(time.Duration(5_000+rand.Intn(3_000)) * time.Millisecond)
	}
}

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	db = initDb()

	hub := newHub()
	go hub.run()
	go barrierSimulator(hub, db)

	e.GET("/", func(c echo.Context) error { return c.String(http.StatusOK, "Hello, World! TODO") })
	e.GET("/ws", func(c echo.Context) error { return websockHandler(c, hub) })
	e.GET("/trials/:id", getTrial)

	e.Logger.Fatal(e.Start(":4110")) // Port mnemonic f1/10
}
