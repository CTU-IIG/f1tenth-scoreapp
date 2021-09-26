package main

import (
	"database/sql/driver"
	"strconv"
	"time"
)

type Duration time.Duration

// MarshalJSON converts the duration to JSON as number of milliseconds (int64)
func (d Duration) MarshalJSON() ([]byte, error) {
	return []byte(strconv.FormatInt(time.Duration(d).Milliseconds(), 10)), nil
}

// UnmarshalJSON converts the duration from JSON number of milliseconds (int64)
func (d *Duration) UnmarshalJSON(s []byte) (err error) {
	r := string(s)
	q, err := strconv.ParseInt(r, 10, 64)
	if err != nil {
		return err
	}
	*(*time.Duration)(d) = time.Duration(q * 1e6)
	return nil
}

// Scan/Value interface for GORM

// Scan value, implements sql.Scanner interface
func (d *Duration) Scan(value interface{}) error {
	*d = Duration(value.(int64))
	return nil
}

// Value return json value, implement driver.Valuer interface
func (d Duration) Value() (driver.Value, error) {
	return int64(d), nil
}
