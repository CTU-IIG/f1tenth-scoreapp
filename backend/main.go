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
	ID        uint           `gorm:"primaryKey" json:"id" param:"id" query:"id"`
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
	TeamID    uint       `json:"team_id" query:"team_id"`
	Team      Team       `json:"team"`
	Round     uint32     `json:"round"`
	State     TrialState `json:"state"`
	Crossings []Crossing `json:"crossings"`
}

type Crossing struct {
	ID      uint `gorm:"primaryKey" json:"id" param:"id" query:"id"`
	Time    Time `json:"time"`
	Ignored bool `json:"ignored"`
	TrialID uint `json:"-"`
}

var (
	db  *gorm.DB
	hub *Hub
)

func getTrial(c echo.Context) error {
	var trial Trial
	if err := c.Bind(&trial); err != nil {
		return err
	}
	if err := db.Preload("Team").Preload("Crossings").First(&trial, trial.ID).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, trial)
}

func setTrialState(c echo.Context, state TrialState) error {
	var trial Trial
	if err := c.Bind(&trial); err != nil {
		return err
	}
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&trial, trial.ID).Error; err != nil {
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
			return fmt.Errorf("Unsupported state '%s'.", string(state))
		}
		if trial.State != expectedState {
			return fmt.Errorf("State should be '%s', not '%s'.",
				string(expectedState), string(trial.State))
		}
		if err := tx.Model(&trial).Updates(&Trial{State: state}).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return err
	}
	broadcastTrial(&trial)
	return c.JSON(http.StatusOK, trial)
}

func getAllTeams(c echo.Context) error {
	var teams []Team
	if err := db.Find(&teams).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, teams)
}

func createTeam(c echo.Context) error {
	var team Team
	if err := c.Bind(&team); err != nil {
		return err
	}
	if err := db.Create(&team).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, team)
}

func updateTeam(c echo.Context) error {
	var team Team
	if err := c.Bind(&team); err != nil {
		return err
	}
	if err := db.Updates(&team).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, team)
}

func getAllTrials(c echo.Context) error {
	var trials []Trial
	if err := db.Preload("Team").Find(&trials).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, trials)
}

func createTrial(c echo.Context) error {
	var trial Trial
	if err := c.Bind(&trial); err != nil {
		return err
	}
	if trial.TeamID == 0 {
		return fmt.Errorf("team_id not specified")
	}
	if err := db.Model(&trial).Association("Team").Find(&trial.Team); err != nil {
		return err
	}
	if trial.Team.ID == 0 {
		return fmt.Errorf("No team with id %d", trial.TeamID)
	}
	if err := db.Omit("Team").Create(&trial).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, &trial)
}

func getFinishedTrials(c echo.Context) error {
	var trials []Trial
	if err := db.Where(&Trial{State: Finished}).Preload("Team").Find(&trials).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, trials)
}

func setCrossingIgnore(c echo.Context, ignored bool) error {
	var crossing Crossing
	if err := c.Bind(&crossing); err != nil {
		return err
	}
	if err := db.First(&crossing, crossing.ID).Error; err != nil {
		return err
	}
	if err := db.Model(&crossing).Update("Ignored", ignored).Error; err != nil {
		return err
	}
	broadcastTrial(&Trial{CommonModelFields: CommonModelFields{ID: crossing.TrialID}})
	return c.JSON(http.StatusOK, crossing)
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
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format:           "${time_custom} ${remote_ip} ${method} ${uri}, status=${status}, error=${error}\n",
		CustomTimeFormat: "2006-01-02 15:04:05.000",
	}))
	e.Use(middleware.Recover())

	db = initDb()

	hub = newHub()
	go hub.run()
	go barrierSimulator(hub, db)

	e.GET("/", func(c echo.Context) error { return c.String(http.StatusOK, "Hello, World! TODO") })
	e.GET("/ws", func(c echo.Context) error { return websockHandler(c, hub) })
	e.GET("/teams", getAllTeams)
	e.POST("/teams", createTeam)
	e.POST("/teams/:id", updateTeam)
	e.GET("/trials", getAllTrials)
	e.POST("/trials", createTrial)
	e.GET("/trials/:id", getTrial)
	e.POST("/trials/:id/start", func(c echo.Context) error { return setTrialState(c, Running) })
	e.POST("/trials/:id/stop", func(c echo.Context) error { return setTrialState(c, Finished) })
	e.POST("/trials/:id/cancel", func(c echo.Context) error { return setTrialState(c, Unfinished) })
	e.GET("/trials/finished", getFinishedTrials)
	e.POST("crossings/:id/ignore", func(c echo.Context) error { return setCrossingIgnore(c, true) })
	e.POST("crossings/:id/unignore", func(c echo.Context) error { return setCrossingIgnore(c, false) })

	e.Logger.Fatal(e.Start(":4110")) // Port mnemonic f1/10
}
