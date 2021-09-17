package main

import (
	"database/sql/driver"
)

type TrialState string

const (
	BeforeStart TrialState = "before_start"
	Running     TrialState = "running"
	Finished    TrialState = "finished"
	Unfinished  TrialState = "unfinished"
)

// SQL interface

func (e *TrialState) Scan(value interface{}) error {
	*e = TrialState(value.(string))
	return nil
}

func (e TrialState) Value() (driver.Value, error) {
	return string(e), nil
}
