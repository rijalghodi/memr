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

func StringPtrToTimePtr(v *string, layout string) *time.Time {
	if v == nil {
		return nil
	}
	time, err := time.Parse(layout, *v)
	if err != nil {
		return nil
	}
	return ToPointer(time)
}

func TimePtrToStringPtr(v *time.Time, layout string) *string {
	if v == nil {
		return nil
	}
	timeString := v.UTC().Format(layout)
	return ToPointer(timeString)
}
