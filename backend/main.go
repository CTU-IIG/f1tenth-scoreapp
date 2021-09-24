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
	Name string `gorm:"uniqueIndex" json:"name"`
	// Races []Race `json:"-"` // can not be easily specified when using TeamA, TeamB instead of just Team
}

type Race struct {
	CommonModelFields
	Type    RaceType `json:"type" gorm:"index"`
	Round   uint32   `json:"round"`
	TeamAID uint     `json:"teamAId" query:"team_a_id"`
	TeamA   Team     `json:"teamA"`
	// TODO: Nullable TeamB? TeamB is returned even when TeamBID == 0
	TeamBID   uint       `json:"teamBId" query:"team_b_id"`
	TeamB     Team       `json:"teamB"`
	State     RaceState  `json:"state" gorm:"index"`
	Crossings []Crossing `json:"crossings"`
}

type Crossing struct {
	ID        uint `gorm:"primaryKey" json:"id" param:"id" query:"id"`
	UpdatedAt Time `json:"updatedAt"`
	Time      Time `json:"time"`
	Ignored   bool `json:"ignored"`
	BarrierId uint `json:"barrierId"`
	TeamA     bool `json:"teamA"`
	RaceID    uint `json:"-"`
}

var (
	db   *gorm.DB
	hub  *Hub
	keys map[string]string
)

func getRace(c echo.Context) error {
	var race Race
	if err := c.Bind(&race); err != nil {
		return err
	}
	if err := db.Preload("TeamA").Preload("TeamB").Preload("Crossings").First(&race, race.ID).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, race)
}

func setRaceState(c echo.Context, state RaceState) error {
	var race Race
	if err := c.Bind(&race); err != nil {
		return err
	}
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&race, race.ID).Error; err != nil {
			return err
		}
		var expectedState RaceState
		switch state {
		case Running:
			expectedState = BeforeStart
		case Finished:
			expectedState = Running
		case Unfinished:
			expectedState = Running
		default:
			return fmt.Errorf("unsupported state '%s'", string(state))
		}
		if race.State != expectedState {
			return fmt.Errorf("state should be '%s', not '%s'",
				string(expectedState), string(race.State))
		}
		if err := tx.Model(&race).Updates(&Race{State: state}).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return err
	}
	if err := broadcastRace(&race); err != nil {
		return err
	}
	return c.JSON(http.StatusOK, race)
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

func getAllRaces(c echo.Context) error {
	var races []Race
	if err := db.Preload("TeamA").Preload("TeamB").Find(&races).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, races)
}

func createRace(c echo.Context) error {
	var race Race
	if err := c.Bind(&race); err != nil {
		return err
	}
	// TODO: Maybe require also the `round` field.
	if race.Type == "" {
		return fmt.Errorf("type not specified")
	}
	if race.TeamAID == 0 {
		return fmt.Errorf("teamAId not specified")
	}
	if err := db.Model(&race).Association("TeamA").Find(&race.TeamA); err != nil {
		return err
	}
	if race.TeamA.ID == 0 {
		return fmt.Errorf("no team with id %d", race.TeamAID)
	}
	if race.Type == HeadToHead {
		if race.TeamBID == 0 {
			return fmt.Errorf("teamBId not specified but required for head_to_head race type")
		}
		// TODO: We might want to check that TeamAID != TeamBID
		if err := db.Model(&race).Association("TeamB").Find(&race.TeamB); err != nil {
			return err
		}
		if race.TeamB.ID == 0 {
			return fmt.Errorf("no team with id %d", race.TeamBID)
		}
	}
	// always force BeforeStart state
	race.State = BeforeStart
	if err := db.Omit("TeamA", "TeamB").Create(&race).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, &race)
}

func getFinishedRaces(c echo.Context) error {
	var races []Race
	if err := db.Where(&Race{State: Finished}).Preload("TeamA").Preload("TeamB").Find(&races).Error; err != nil {
		return err
	}
	return c.JSON(http.StatusOK, races)
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

		// also update associated Race's (if any) UpdatedAt field
		// so the frontend can find out what is the latest version
		if crossing.RaceID != 0 {
			if err := db.Model(&Race{}).Where("id = ?", crossing.RaceID).Update("UpdatedAt", time.Now()).Error; err != nil {
				return err
			}
		}

		return nil

	})
	if err != nil {
		return err
	}
	if err := broadcastRace(&Race{CommonModelFields: CommonModelFields{ID: crossing.RaceID}}); err != nil {
		return err
	}
	return c.JSON(http.StatusOK, crossing)
}

func initDb() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("scoreapp.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	err = db.AutoMigrate(&Team{}, &Race{}, &Crossing{})
	if err != nil {
		log.Fatal(err)
	}

	// db = db.Debug()

	// create initial testing data

	db.FirstOrCreate(new(Team), Team{Name: "Formula Trinity Autonomous"})
	db.FirstOrCreate(new(Team), Team{Name: "HiPeRT Modena"})
	db.FirstOrCreate(new(Team), Team{Name: "Rasoul Najakhani"})
	db.FirstOrCreate(new(Team), Team{Name: "Super TU Kart"})
	db.FirstOrCreate(new(Team), Team{Name: "TU Wien"})
	db.FirstOrCreate(new(Team), Team{Name: "Ředkvičky"})

	return db
}

func broadcastRace(race *Race) error {
	type Message struct {
		Race *Race `json:"race"`
	}

	var fullRace Race
	if err := db.Model(&Race{}).Preload("Crossings").Preload("TeamA").Preload("TeamB").First(&fullRace, race.ID).Error; err != nil {
		return err
	}
	b, err := json.Marshal(&Message{&fullRace})
	if err != nil {
		return err
	}
	hub.broadcast <- b
	return nil
}

func barrierSimulator(hub *Hub, db *gorm.DB) {
	time.Sleep(1 * time.Second)
	for {
		var race Race
		if err := db.Last(&race, "state = ?", Running).Error; err != nil {
			log.Printf("could not generate new crossing because: %s", err)
		} else if race.ID == 0 {
			log.Printf("could not generate new crossing because: there is no race")
		} else {
			log.Printf("adding new crossing for race %d", race.ID)
			// this also updates Race's UpdatedAt which is what we want
			// so the frontend can find out what is the latest version
			db.Model(&race).Association("Crossings").Append(&Crossing{
				Time:      Time(time.Now()),
				Ignored:   false,
				BarrierId: 1,
			})
			broadcastRace(&race)
			// reset the race id so that next time gorm will rerun the query
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
	loopback := flag.Bool("loopback", false, "Listen only on lo interface (127.0.0.1)")
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
	e.GET("/races", getAllRaces)
	e.POST("/races", createRace)
	e.GET("/races/:id", getRace)
	e.POST("/races/:id/start", func(c echo.Context) error { return setRaceState(c, Running) })
	e.POST("/races/:id/stop", func(c echo.Context) error { return setRaceState(c, Finished) })
	e.POST("/races/:id/cancel", func(c echo.Context) error { return setRaceState(c, Unfinished) })
	e.GET("/races/finished", getFinishedRaces)
	e.POST("/crossings/:id/ignore", func(c echo.Context) error { return setCrossingIgnore(c, true) })
	e.POST("/crossings/:id/unignore", func(c echo.Context) error { return setCrossingIgnore(c, false) })
	// TODO: /crossings/:id/ setTeamA to true/false

	var host string = ""
	if *loopback {
		host = "localhost"
	}
	e.Logger.Fatal(e.Start(host + ":4110")) // Port mnemonic f1/10
}
