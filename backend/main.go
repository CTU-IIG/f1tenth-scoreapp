package main

import (
	"encoding/json"
	"fmt"
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
	State     TrialState `json:"state"`
	Crossings []Crossing `json:"crossings"`
}

type Crossing struct {
	ID      uint `gorm:"primaryKey" json:"id"`
	Time    Time `json:"time"`
	Ignored bool `json:"ignored"`
	TrialID uint `json:"-"`
}

var (
	db  *gorm.DB
	hub *Hub
)

func getTrial(c echo.Context) error {
	var trial *Trial
	if err := db.Preload("Team").Preload("Crossings").First(&trial, c.Param("id")).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, *trial)
}

func setTrialState(c echo.Context, state TrialState) error {
	var trial *Trial
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&trial, c.Param("id")).Error; err != nil {
			return err
		}
		var expectedState TrialState
		switch state {
		case Running:
			expectedState = BeforeStart
		case Finished:
			expectedState = Running
		case Unfinished:
			expectedState = Running
		default:
			return c.String(http.StatusBadRequest,
				fmt.Sprintf("Unspported state '%s'.", string(state)))
		}
		if trial.State != expectedState {
			return c.String(http.StatusBadRequest,
				fmt.Sprintf("State should be '%s', not '%s'.",
					string(expectedState), string(trial.State)))
		}
		if err := tx.Model(&trial).Updates(&Trial{State: state}).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil || c.Response().Status != http.StatusOK {
		return err
	}
	broadcastTrial(trial)
	return c.JSON(http.StatusOK, *trial)
}

func getAllTrials(c echo.Context) error {
	var trials []Trial
	if err := db.Preload("Team").Find(&trials).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, trials)
}

func getFinishedTrials(c echo.Context) error {
	var trials []Trial
	if err := db.Where(&Trial{State: Finished}).Preload("Team").Find(&trials).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, trials)
}

func setCrossingIgnore(c echo.Context, ignored bool) error {
	var id uint
	var crossing *Crossing
	err := echo.PathParamsBinder(c).Uint("id", &id)
	if err.BindError() != nil {
		return err.BindError()
	}
	if err := db.First(&crossing, id).Error; err != nil {
		return err
	}
	if err := db.Model(&crossing).Update("Ignored", ignored).Error; err != nil {
		return err
	}
	broadcastTrial(&Trial{CommonModelFields: CommonModelFields{ID: crossing.TrialID}})
	return c.JSON(http.StatusOK, *crossing)
}

func initDb() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("scoreapp.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	db.AutoMigrate(&Team{}, &Trial{}, &Crossing{})

	//db = db.Debug()

	// Create objects for testing
	var team Team
	db.FirstOrCreate(&team, Team{Name: "Ředkvičky"})

	var trial Trial
	db.FirstOrCreate(&trial, &Trial{TeamID: team.ID, Round: uint32(1), State: Finished})
	db.Model(&trial).Association("Crossings").Append(&Crossing{Time: Time(time.Now().Add(-12 * time.Second)), Ignored: false})
	db.Model(&trial).Association("Crossings").Append(&Crossing{Time: Time(time.Now()), Ignored: false})

	var trial2 Trial
	db.FirstOrCreate(&trial2, &Trial{TeamID: team.ID, Round: uint32(2), State: Running})

	return db
}

func broadcastTrial(trial *Trial) {
	type Message struct {
		Trial *Trial `json:"trial"`
	}

	var fullTrial Trial
	db.Model(&Trial{}).Preload("Crossings").Preload("Team").First(&fullTrial, trial.ID)

	b, err := json.Marshal(&Message{&fullTrial})
	if err != nil {
		log.Fatal(err)
	}
	hub.broadcast <- b
}

func barrierSimulator(hub *Hub, db *gorm.DB) {
	var trial Trial
	db.Model(&Trial{}).Last(&trial)
	time.Sleep(1 * time.Second)
	for {
		log.Printf("New crossing")
		db.Model(&trial).Association("Crossings").Append(&Crossing{Time: Time(time.Now()), Ignored: false})
		broadcastTrial(&trial)

		time.Sleep(time.Duration(5_000+rand.Intn(3_000)) * time.Millisecond)
	}
}

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	db = initDb()

	hub = newHub()
	go hub.run()
	go barrierSimulator(hub, db)

	e.GET("/", func(c echo.Context) error { return c.String(http.StatusOK, "Hello, World! TODO") })
	e.GET("/ws", func(c echo.Context) error { return websockHandler(c, hub) })
	e.GET("/trials", getAllTrials)
	e.GET("/trials/:id", getTrial)
	e.POST("/trials/:id/start", func(c echo.Context) error { return setTrialState(c, Running) })
	e.POST("/trials/:id/stop", func(c echo.Context) error { return setTrialState(c, Finished) })
	e.POST("/trials/:id/cancel", func(c echo.Context) error { return setTrialState(c, Unfinished) })
	e.GET("/trials/finished", getFinishedTrials)
	e.POST("crossings/:id/ignore", func(c echo.Context) error { return setCrossingIgnore(c, true) })
	e.POST("crossings/:id/unignore", func(c echo.Context) error { return setCrossingIgnore(c, false) })

	e.Logger.Fatal(e.Start(":4110")) // Port mnemonic f1/10
}
