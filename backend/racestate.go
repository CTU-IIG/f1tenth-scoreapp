package main

import (
	"database/sql/driver"
)

type RaceState string

const (
	BeforeStart RaceState = "before_start"
	Running     RaceState = "running"
	Finished    RaceState = "finished"
	Unfinished  RaceState = "unfinished"
)

// SQL interface

func (e *RaceState) Scan(value interface{}) error {
	*e = RaceState(value.(string))
	return nil
}

func (e RaceState) Value() (driver.Value, error) {
	return string(e), nil
}
