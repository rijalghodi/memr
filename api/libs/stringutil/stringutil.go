package stringutil

import (
	"strings"
	"unicode"
)

// ToSnakeCase converts a string to snake_case
func ToSnakeCase(s string) string {
	var result strings.Builder
	for i, r := range s {
		if unicode.IsUpper(r) {
			if i > 0 {
				result.WriteRune('_')
			}
			result.WriteRune(unicode.ToLower(r))
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}

// ToCamelCase converts a string to camelCase
func ToCamelCase(s string) string {
	words := strings.Split(s, "_")
	for i := 1; i < len(words); i++ {
		words[i] = strings.Title(words[i])
	}
	return strings.Join(words, "")
}

// ToPascalCase converts a string to PascalCase
func ToPascalCase(s string) string {
	words := strings.Split(s, "_")
	for i := 0; i < len(words); i++ {
		words[i] = strings.Title(words[i])
	}
	return strings.Join(words, "")
}

// Truncate truncates a string to a specified length
func Truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

// Contains checks if a string slice contains a specific string
func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// IsEmpty checks if a string is empty or contains only whitespace
func IsEmpty(s string) bool {
	return strings.TrimSpace(s) == ""
}

// Reverse reverses a string
func Reverse(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

// RemoveSpaces removes all spaces from a string
func RemoveSpaces(s string) string {
	return strings.ReplaceAll(s, " ", "")
}

// FirstN returns the first n characters of a string
func FirstN(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}

// LastN returns the last n characters of a string
func LastN(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[len(s)-n:]
}


