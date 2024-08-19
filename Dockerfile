
# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install Air (for development)
RUN go install github.com/air-verse/air@latest

# Install Go
RUN apk add --no-cache gcc musl-dev

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

#--------------------------------------------------------------------------------------------------------------------------- 

FROM alpine:latest

RUN apk --no-cache add ca-certificates

# Copy Go installation from builder stage
COPY --from=builder /usr/local/go /usr/local/go

# Set the Go binary path
ENV PATH="/usr/local/go/bin:${PATH}"

WORKDIR /app

# Copy the built application binary
COPY --from=builder /app/main .

# Copy source code for Air (development)
COPY --from=builder /go/bin/air /usr/local/bin/air
COPY . .

EXPOSE 8080

# No default CMD here; it will be handled in the compose files

















































# # Build stage
# FROM golang:1.23-alpine AS builder
#
# WORKDIR /app
#
# # Install Air
# RUN go install github.com/air-verse/air@latest
#
# # Install Go in the final stage
# RUN apk add --no-cache gcc musl-dev
#
# COPY go.mod ./
# RUN go mod download
#
# COPY . .
# RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .
#
# #-------------------------------------------------------------------------------------------------
# FROM alpine:latest
#
# RUN apk --no-cache add ca-certificates
#
# # Copy Go installation from builder stage
# COPY --from=builder /usr/local/go /usr/local/go
#
# # Set the Go binary path
# ENV PATH="/usr/local/go/bin:${PATH}"
#
# WORKDIR /app
#
# # Copy Air and the built application
# COPY --from=builder /go/bin/air /usr/local/bin/air
# COPY --from=builder . .
# COPY .air.toml .
#
# EXPOSE 8080
#
# # Use Air for development
# CMD ["air", "-c", ".air.toml"]
#


