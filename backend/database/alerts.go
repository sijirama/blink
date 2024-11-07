package database

import "chookeye-core/schemas"

// i had to create this handler here, because it was causing import cycles and i was tired of refactoring
func GetAlertsNearLocation(latitude, longitude, radius float64) ([]schemas.Alert, error) {
	var alerts []schemas.Alert

	//https://en.wikipedia.org/wiki/Haversine_formula

	err := Store.Preload("User").Where("status = ?", "active").Where(`
        6371000 * acos(
            cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
        ) <= ?
    `, latitude, longitude, latitude, radius).Find(&alerts).Error

	return alerts, err
}
