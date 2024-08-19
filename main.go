package main

import "chookeye-core/api"

func main() {
	r := api.SetupRouter()
	r.Run()
}
