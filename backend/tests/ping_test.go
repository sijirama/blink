package tests

import (
	"chookeye-core/api"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

// func TestHealthcheckRoute(t *testing.T) {
// 	router := api.SetupRouter()
//
// 	w := httptest.NewRecorder()
// 	req, _ := http.NewRequest("GET", "/healthcheck", nil)
// 	router.ServeHTTP(w, req)
//
// 	assert.Equal(t, http.StatusOK, w.Code)
// 	assert.Equal(t, "OK", w.Body.String())
// }

func TestPingRoute(t *testing.T) {
	router := api.SetupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.Equal(t, "pong", w.Body.String())
}
