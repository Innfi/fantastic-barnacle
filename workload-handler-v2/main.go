package main

import (
	"fmt"
	"log"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func main() {
	log.Println("workload-handler-v2")

	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": "localhost",
		"group.id":          "barnacle",
		"auto.offset.reset": "earlist",
	})
	if err != nil {
		panic(err)
	}
	defer c.Close()

	err = c.SubscribeTopics([]string{"myTopic", "^aRegex.*[Tt]opic"}, nil)
	if err != nil {
		panic(err)
	}

	run := true
	for run {
		msg, err := c.ReadMessage(time.Second)
		if err == nil {
			fmt.Printf("%s] message: %s\n", msg.TopicPartition, string(msg.Value))
		} else if !err.(kafka.Error).IsTimeout() {
			fmt.Errorf("consumer error: %v (%v)\n", err, msg)
		}
	}
}
