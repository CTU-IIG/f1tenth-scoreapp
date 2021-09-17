# f1tenth-scoreapp-backend

## Installation

1. Install go - either follow official [Go
   documentation](https://golang.org/doc/install) or, on Debian/Ubuntu
   run:

        apt install golang

2. Go to the `backend` directory and run:

        go build

3. Run the backend

        ./scoreapp

## Testing

The backend listens on port 4110. Point your web browser to
http://localhost:4110 and you should see a "Hello world" page.

The backend creates a database called `scoreapp.db` in the current
directory and prefills it with some testing data. You can safely
delete the file and start from scratch.

The light barrier is simulated and produces trial updates, which get
stored to the database and broadcasted to web sockets.

Implemented endpoints:

- GET `/trial/<num>` – returns JSON of the trial `<num>`. Currently,
  we have only 1 and 2.

  Testing: `curl http://loclahost:4110/trial/1`

- `/ws` – websocket. All connected clients will automatically receive
  updates about the current (2) trial.

  Testing: `websocat ws://localhost:4110/ws`

  Note: [websocat home page][]

[websocat]: https://github.com/vi/websocat
