// cron/cron.go

package cron

import (
	"fmt"
	"log"
	"time"

	"chookeye-core/processes" // Import your existing processes package

	"github.com/go-co-op/gocron/v2"
)

// CronServer struct to hold the scheduler
type CronServer struct {
	scheduler gocron.Scheduler
}

// InitializeCronServer initializes the cron server, adds jobs, and starts the server.
func InitializeCronServer() *CronServer {
	// Create a new scheduler
	scheduler, err := gocron.NewScheduler()

	if err != nil {
		log.Panicln("Failed to create scheduler for cron server")
	}

	cronServer := &CronServer{scheduler: scheduler}

	// Add jobs from the processes package to the cron server
	cronServer.addJob("alert_management", 2*time.Hour, processes.RunAlertManagement) // Replace with your function

	// Start the cron server
	cronServer.startServer()

	return cronServer
}

// addJob adds a job to the cron server with the given interval and task function
func (cs *CronServer) addJob(cron_name string, interval time.Duration, task func()) {
	j, err := cs.scheduler.NewJob(gocron.DurationJob(interval), gocron.NewTask(task))

	if err != nil {
		log.Println("Failed to add job:", err)
	}

	fmt.Println(cron_name, " has id of ", j.ID())

	//add to cronmap
}

// startServer starts the cron server
func (cs *CronServer) startServer() {
	cs.scheduler.Start()
	log.Println("\n\nCron server started.\n\n")
}
