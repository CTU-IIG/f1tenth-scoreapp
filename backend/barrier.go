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
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf(name+": %v", err)
			}
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
			// TODO: save crossing without race association
		} else if race.ID == 0 {
			log.Printf(name + ": could not generate new crossing because: there is no race")
			// TODO: save crossing without race association
		} else {
			ts := Time(time.UnixMicro(msg.Timestamp))
			log.Printf(name+": adding new crossing for race %d at %v", race.ID, time.Time(ts))
			// this also updates Race's UpdatedAt which is what we want
			// so the frontend can find out what is the latest version
			db.Model(&race).Association("Crossings").Append(&Crossing{
				Time:      ts,
				Ignored:   false,
				BarrierId: b.Id,
			})
			broadcastRace(&race)
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
