package main

import (
	"database/sql/driver"
	"math"
	"strconv"
	"time"
)

// Time defines a timestamp, which is JSON-encoded as a fractional number of seconds since epoch
type Time time.Time

// Convert the timestamp to JSON
func (t Time) MarshalJSON() ([]byte, error) {
	return []byte(strconv.FormatFloat(float64(time.Time(t).UnixNano())/1e9, 'f', 3, 64)), nil
}

// Convert the timestamp from JSON
func (t *Time) UnmarshalJSON(s []byte) (err error) {
	r := string(s)
	q, err := strconv.ParseFloat(r, 64)
	if err != nil {
		return err
	}
	*(*time.Time)(t) = time.Unix(int64(math.Floor(q)), int64((q-math.Floor(q))*1e9))
	return nil
}

// Scan/Value interface for GORM

// Scan value, implements sql.Scanner interface
func (t *Time) Scan(value interface{}) error {
	*t = Time(value.(time.Time))
	return nil
}

// Value return json value, implement driver.Valuer interface
func (t Time) Value() (driver.Value, error) {
	return time.Time(t), nil
}
