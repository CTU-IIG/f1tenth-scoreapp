package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (

	// Send pings to peer with this period. Must be less than pongWait.
	barrierPingPeriod = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	barrierPongWait = (barrierPingPeriod * 11) / 10
)

type Barrier struct {
	// The websocket connection.
	conn *websocket.Conn
	hub  *Hub

	// Barrier ID
	Id uint

	RegistrationOk chan bool
}

// reader reads messages from the barrier, updates the database and notifies the hub
func (b *Barrier) reader(conn *websocket.Conn) {
	b.conn = conn

	go b.pinger()

	name := fmt.Sprintf("barrier%d", b.Id)
	defer func() {
		log.Println(name + ": closing websocket")
		b.conn.Close()
		b.hub.unregisterBarrier <- b
	}()
	b.conn.SetReadLimit(maxMessageSize)

	b.conn.SetReadDeadline(time.Now().Add(barrierPongWait))
	b.conn.SetPongHandler(func(string) error { b.conn.SetReadDeadline(time.Now().Add(barrierPongWait)); return nil })

	for {
		_, message, err := b.conn.ReadMessage()
		if err != nil {
			log.Printf(name+": %v", err)
			break
		}
		var msg struct {
			Timestamp int64 `json:"timestamp"`
		}
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf(name+": message parse error: %v", err)
			continue
		}
		if msg.Timestamp == 0 {
			log.Printf(name+": missing timestamp in: %v", string(message))
			continue
		}
		var race Race
		if err := db.Last(&race, "state = ?", Running).Error; err != nil {
			log.Printf(name+": error obtaining running race: %v", err)
		}
		ts := Time(time.UnixMicro(msg.Timestamp))
		log.Printf(name+": adding new crossing for race %d at %v", race.ID, time.Time(ts))
		crossing := Crossing{
			Time:      ts,
			Ignored:   false,
			BarrierId: b.Id,
		}
		if race.ID != 0 {
			if race.Type == HeadToHead {
				// Switch crossing teams in round robin fashion. If needed, barrier operators
				// can correct the team associated with the crossing via the frontend.
				var lastCrossing Crossing
				var crossingCnt int64
				filter := Crossing{RaceID: race.ID, BarrierId: b.Id, Ignored: false}
				db.Model(&Crossing{}).Where(&filter).Where("ignored = ?", false).Count(&crossingCnt)
				if err := db.Where(&filter).Where("ignored = ?", false).Last(&lastCrossing).Error; err != nil {
					// First crossing in a race
					if crossing.BarrierId == 1 {
						crossing.Team = TeamA
					} else if crossing.BarrierId == 2 {
						crossing.Team = TeamB
					}
				} else {
					if crossingCnt == 1 && (time.Time(crossing.Time).Sub(time.Time(lastCrossing.Time)).Milliseconds() < 1000) {
						crossing.Ignored = true
					}
					// Later crossings in the race
					if lastCrossing.Team == TeamA {
						crossing.Team = TeamB
					} else if lastCrossing.Team == TeamB {
						crossing.Team = TeamA
					}
				}
				log.Printf(name+": associating crossing with team %d", crossing.Team)
			}
			// this also updates Race's UpdatedAt which is what we want
			// so the frontend can find out what is the latest version
			if err := db.Model(&race).Association("Crossings").Append(&crossing); err != nil {
				log.Printf(name+": failed to append crossing: %v", err)
				continue
			}
			broadcastRace(&race)
		} else {
			if err := db.Create(&crossing).Error; err != nil {
				log.Printf(name+": failed to crate crossing: %v", err)
			}
		}
	}
}

func (b *Barrier) pinger() {
	ticker := time.NewTicker(barrierPingPeriod)
	defer func() {
		ticker.Stop()
		b.conn.Close()
	}()
	for {
		<-ticker.C
		b.conn.SetWriteDeadline(time.Now().Add(writeWait))
		if err := b.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			return
		}
	}
}
