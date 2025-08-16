#!/bin/bash

echo "Starting FinTrack Backend..."

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed or not in PATH"
    exit 1
fi

# Check if the jar file exists
if [ ! -f "target/backend-0.0.1-SNAPSHOT.jar" ]; then
    echo "Error: JAR file not found. Please run 'mvn package' first."
    exit 1
fi

echo "Starting Spring Boot application..."
java -jar target/backend-0.0.1-SNAPSHOT.jar