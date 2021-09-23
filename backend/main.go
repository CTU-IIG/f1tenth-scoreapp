package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type CommonModelFields struct {
	ID        uint           `gorm:"primaryKey" json:"id" param:"id" query:"id"`
	CreatedAt Time           `json:"-"`
	UpdatedAt Time           `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Team struct {
	CommonModelFields
	Name   string  `gorm:"uniqueIndex" json:"name"`
	Trials []Trial `json:"-"`
}

type Trial struct {
	CommonModelFields
	TeamID    uint       `json:"teamId" query:"team_id"`
	Team      Team       `json:"team"`
	Round     uint32     `json:"round"`
	State     TrialState `json:"state" gorm:"index"`
	Crossings []Crossing `json:"crossings"`
}

type Crossing struct {
	ID        uint `gorm:"primaryKey" json:"id" param:"id" query:"id"`
	UpdatedAt Time `json:"updatedAt"`
	Time      Time `json:"time"`
	Ignored   bool `json:"ignored"`
	TrialID   uint `json:"-"`
}

var (
	db   *gorm.DB
	hub  *Hub
	keys map[string]string
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
	if err := broadcastTrial(&trial); err != nil {
		return err
	}
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
		return fmt.Errorf("teamId not specified")
	}
	if err := db.Model(&trial).Association("Team").Find(&trial.Team); err != nil {
		return err
	}
	if trial.Team.ID == 0 {
		return fmt.Errorf("no team with id %d", trial.TeamID)
	}
	trial.State = BeforeStart
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
	err := db.Transaction(func(tx *gorm.DB) error {

		if err := db.Model(&crossing).Update("Ignored", ignored).Error; err != nil {
			return err
		}

		// also update associated Trial's (if any) UpdatedAt field
		// so the frontend can find out what is the latest version
		if crossing.TrialID != 0 {
			if err := db.Model(&Trial{}).Where("id = ?", crossing.TrialID).Update("UpdatedAt", time.Now()).Error; err != nil {
				return err
			}
		}

		return nil

	})
	if err != nil {
		return err
	}
	if err := broadcastTrial(&Trial{CommonModelFields: CommonModelFields{ID: crossing.TrialID}}); err != nil {
		return err
	}
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

func broadcastTrial(trial *Trial) error {
	type Message struct {
		Trial *Trial `json:"trial"`
	}

	var fullTrial Trial
	if err := db.Model(&Trial{}).Preload("Crossings").Preload("Team").First(&fullTrial, trial.ID).Error; err != nil {
		return err
	}
	b, err := json.Marshal(&Message{&fullTrial})
	if err != nil {
		return err
	}
	hub.broadcast <- b
	return nil
}

func barrierSimulator(hub *Hub, db *gorm.DB) {
	time.Sleep(1 * time.Second)
	for {
		var trial Trial
		if err := db.Last(&trial, "state = ?", Running).Error; err != nil {
			log.Printf("could not generate new crossing because: %s", err)
		} else if trial.ID == 0 {
			log.Printf("could not generate new crossing because: there is no trial")
		} else {
			log.Printf("adding new crossing for trial %d", trial.ID)
			// this also updates Trial's UpdatedAt which is what we want
			// so the frontend can find out what is the latest version
			db.Model(&trial).Association("Crossings").Append(&Crossing{Time: Time(time.Now()), Ignored: false})
			broadcastTrial(&trial)
			// reset the trial id so that next time gorm will rerun the query
		}
		time.Sleep(time.Duration(5_000+rand.Intn(3_000)) * time.Millisecond)
	}
}

func barrierWebsockHandler(c echo.Context) error {
	var id uint
	if err := echo.PathParamsBinder(c).MustUint("id", &id).BindError(); err != nil {
		return err
	}

	if len(keys) > 0 {
		key, ok := keys[c.Request().URL.Path]
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "No key configured for %s", c.Request().URL.Path)
		}
		if c.Request().Header.Get(echo.HeaderAuthorization) != key {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid key")
		}
	}
	barrier := &Barrier{Id: id, hub: hub, RegistrationOk: make(chan bool)}
	hub.registerBarrier <- barrier
	if ok := <-barrier.RegistrationOk; !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "Barrier already connected")
	}

	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	go barrier.reader(ws)
	return nil
}

func checkKey(key string, c echo.Context) (bool, error) {
	if postKey, ok := keys["POST"]; ok {
		return key == postKey, nil
	} else {
		return false, fmt.Errorf("no POST key configured")
	}
}

func main() {
	sim := flag.Bool("sim", false, "Simulate barrier")
	keysFile := flag.String("keys", "", "File with JSON-encoded API keys")
	flag.Parse()

	if *keysFile != "" {
		content, err := os.ReadFile(*keysFile)
		if err != nil {
			log.Fatalf("key reading: %v", err)
		}

		json.Unmarshal(content, &keys)
	}

	e := echo.New()
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format:           "${time_custom} ${remote_ip} ${method} ${uri}, status=${status}, error=${error}\n",
		CustomTimeFormat: "2006-01-02 15:04:05.000",
	}))
	e.Use(middleware.Recover())
	// As we access API from different origin,
	// browsers require the server to implement CORS.
	// About CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
	// Echo docs: https://echo.labstack.com/middleware/cors/
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		// AllowOrigins defaults to []string{"*"}.
		// AllowMethods defaults to all methods (DefaultCORSConfig.AllowMethods)
		AllowHeaders: []string{
			// We don't need to include CORS-safelisted headers,
			// if we are okay we the Additional restrictions. But in our use-case, we are NOT.
			// See https://developer.mozilla.org/en-US/docs/Glossary/CORS-safelisted_request_header
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
		// AllowCredentials defaults to false (which is ok for our use-case)
		// ExposeHeaders defaults to []string{} (which is ok for our use-case)
		// Allow browsers to cache preflight requests for 1 hour.
		MaxAge: 3600,
	}))
	if len(keys) > 0 {
		// Check auth. key for all POST requests. Barrier keys (GET)
		// are checked in barrierWebsockHandler.
		e.Use(middleware.KeyAuthWithConfig(middleware.KeyAuthConfig{
			Skipper: func(c echo.Context) bool {
				// No auth for GET requests
				return c.Request().Method == "GET"
			},
			Validator: checkKey,
		}))
	}

	db = initDb()

	hub = newHub()
	go hub.run()

	if *sim {
		go barrierSimulator(hub, db)
	}

	e.GET("/", func(c echo.Context) error { return c.String(http.StatusOK, "F1tenth ScoreApp works!") })
	e.GET("/ws", func(c echo.Context) error { return websockHandler(c, hub) })
	e.GET("/barrier/:id", barrierWebsockHandler)
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
	e.POST("/crossings/:id/ignore", func(c echo.Context) error { return setCrossingIgnore(c, true) })
	e.POST("/crossings/:id/unignore", func(c echo.Context) error { return setCrossingIgnore(c, false) })

	e.Logger.Fatal(e.Start(":4110")) // Port mnemonic f1/10
}
