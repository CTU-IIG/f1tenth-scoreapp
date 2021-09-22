package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type Barrier struct {
	// The websocket connection.
	conn *websocket.Conn
	hub  *Hub

	// Barrier ID (0 if not yet known)
	id uint
}

// reader reads messages from the barrier, updates the database and notifies the hub
func (b *Barrier) reader() {
	name := fmt.Sprintf("barrier%d", b.id)
	defer func() {
		log.Println(name + ": closing websocket")
		delete(barriers, b.id)
		b.conn.Close()
	}()
	b.conn.SetReadLimit(maxMessageSize)
	// 	const pongWait = 10 * time.Second
	// 	b.conn.SetReadDeadline(time.Now().Add(pongWait))
	// 	b.conn.SetPongHandler(func(string) error { b.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

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
		var trial Trial
		if err := db.Last(&trial, "state = ?", Running).Error; err != nil {
			log.Printf(name+": error obtaining running trial: %v", err)
		} else if trial.ID == 0 {
			log.Printf(name + ": could not generate new crossing because: there is no trial")
		} else {
			ts := Time(time.UnixMicro(msg.Timestamp))
			log.Printf(name+": adding new crossing for trial %d at %v", trial.ID, time.Time(ts))
			// this also updates Trial's UpdatedAt which is what we want
			// so the frontend can find out what is the latest version
			db.Model(&trial).Association("Crossings").Append(&Crossing{Time: ts, Ignored: false})
			broadcastTrial(&trial)
		}
	}
}
