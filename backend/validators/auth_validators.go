package validators

import (
	"chookeye-core/schemas"
	"errors"
	"regexp"
)

func ValidateUser(user *schemas.User) error {
	if len(user.Username) < 3 {
		return errors.New("username must be at least 3 characters long")
	}

	if len(user.Password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}

	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	if !emailRegex.MatchString(user.Email) {
		return errors.New("invalid email format")
	}

	return nil
}
