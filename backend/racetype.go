package main

import (
	"database/sql/driver"
)

type RaceType string

const (
	TimeTrial  RaceType = "time_trial"
	HeadToHead RaceType = "head_to_head"
)

// SQL interface

func (e *RaceType) Scan(value interface{}) error {
	*e = RaceType(value.(string))
	return nil
}

func (e RaceType) Value() (driver.Value, error) {
	return string(e), nil
}
