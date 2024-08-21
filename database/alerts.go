package database

import "chookeye-core/schemas"

func GetAlertsNearLocation(latitude, longitude float64, radius float64) ([]schemas.Alert, error) {
	var alerts []schemas.Alert

	//https://en.wikipedia.org/wiki/Haversine_formula

	err := Store.Where(`
        6371000 * acos(
            cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
        ) <= ?
    `, latitude, longitude, latitude, radius).Find(&alerts).Error

	return alerts, err
}
