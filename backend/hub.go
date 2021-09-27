// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"encoding/json"
	"log"
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Inbound messages from the clients.
	broadcast chan []byte

	// Registered clients.
	clients map[*Client]bool

	// Register requests from the clients.
	registerClient chan *Client

	// Unregister requests from clients.
	unregisterClient chan *Client

	// Registered barriers.
	barriers map[uint]*Barrier

	// Register requests from the barriers.
	registerBarrier chan *Barrier

	// Unregister requests from barriers.
	unregisterBarrier chan *Barrier
}

func newHub() *Hub {
	return &Hub{
		broadcast: make(chan []byte),

		clients:          make(map[*Client]bool),
		registerClient:   make(chan *Client),
		unregisterClient: make(chan *Client),

		barriers:          make(map[uint]*Barrier),
		registerBarrier:   make(chan *Barrier),
		unregisterBarrier: make(chan *Barrier),
	}
}

func (h *Hub) sendBroadcast(message []byte) {
	for client := range h.clients {
		select {
		case client.send <- message:
		default:
			close(client.send)
			delete(h.clients, client)
		}
	}
}

func (h *Hub) getBarrierStatusMsg() ([]byte, error) {
	type BarrierStatus struct {
		Barriers []uint `json:"barriers"`
	}
	bs := BarrierStatus{Barriers: make([]uint, 0)}
	for _, barrier := range h.barriers {
		bs.Barriers = append(bs.Barriers, barrier.Id)
	}
	b, err := json.Marshal(bs)
	if err != nil {
		log.Printf("barrier status marshal error: %v", err)
	}
	return b, err
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.registerClient:
			h.clients[client] = true

			// Send the client barrier status
			if b, err := h.getBarrierStatusMsg(); err == nil {
				client.send <- b
			}

		case client := <-h.unregisterClient:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case barrier := <-h.registerBarrier:
			if _, ok := h.barriers[barrier.Id]; ok {
				barrier.RegistrationOk <- false
				break
			} else {
				h.barriers[barrier.Id] = barrier
				barrier.RegistrationOk <- true
				log.Printf("registering barrier %d\n", barrier.Id)
			}
			if b, err := h.getBarrierStatusMsg(); err == nil {
				h.sendBroadcast(b)
			}
		case barrier := <-h.unregisterBarrier:
			log.Printf("unregistering barrier %d\n", barrier.Id)
			delete(h.barriers, barrier.Id)
			if b, err := h.getBarrierStatusMsg(); err == nil {
				h.sendBroadcast(b)
			}
		case message := <-h.broadcast:
			h.sendBroadcast(message)
		}
	}
}
