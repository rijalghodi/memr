package util

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
