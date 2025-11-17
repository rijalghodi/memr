package util

import "time"

func ToPointer[T any](v T) *T {
	return &v
}

func ToValue[T any](v *T) T {
	if v == nil {
		var zero T
		return zero
	}
	return *v
}

func ToPointerTimeString(v *time.Time) *string {
	if v == nil {
		return nil
	}
	timeString := v.Format(time.RFC3339)
	return ToPointer(timeString)
}
