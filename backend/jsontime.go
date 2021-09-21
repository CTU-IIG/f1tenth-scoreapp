package main

import (
	"database/sql/driver"
	"strconv"
	"time"
)

// Time defines a timestamp, which is JSON-encoded as a fractional number of seconds since epoch
type Time time.Time

// MarshalJSON converts the timestamp to JSON as number of milliseconds (int64)
func (t Time) MarshalJSON() ([]byte, error) {
	return []byte(strconv.FormatInt(time.Time(t).UnixMilli(), 10)), nil
}

// UnmarshalJSON converts the timestamp from JSON number of milliseconds (int64)
func (t *Time) UnmarshalJSON(s []byte) (err error) {
	r := string(s)
	q, err := strconv.ParseInt(r, 10, 64)
	if err != nil {
		return err
	}
	*(*time.Time)(t) = time.UnixMilli(q)
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
