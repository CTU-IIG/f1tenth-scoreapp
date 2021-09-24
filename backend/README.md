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

## Usage

The backend listens on port 4110. Point your web browser to
http://localhost:4110 and you should see a "Hello world" page.

The backend creates a database called `scoreapp.db` in the current
directory and prefills it with some testing data. You can safely
delete the file and start from scratch.

If started with `-sim` switch, the light barrier is simulated and
produces race updates, which get stored to the database and
broadcasted to web sockets.

Implemented endpoints:

- GET `/teams` – returns JSON of all teams
- POST `/teams` – creates a new team
  - Testing: `curl -H 'Content-Type: application/json' -d '{"name": "HokusPokus"}' -X POST 'http://localhost:4110/teams'`
- POST `/teams/<num>` - edits a team
  - Testing: `curl -H 'Content-Type: application/json' -d '{"name": "SomeName"}' -X POST 'http://localhost:4110/teams/1'`
- GET `/races` – returns JSON of all races (without crossings).
- POST `/races` – creates a new race
  - Testing: `curl -H 'Content-Type: application/json' -d '{"type":"time_trial","teamAId":1,"round":1}' -X POST 'http://localhost:4110/races'`
- GET `/races/<num>` – returns JSON of the race `<num>`. Currently,
  we have only 1 and 2.
  - Testing: `curl http://localhost:4110/races/1`
- POST `/races/<num>/start` – changes race's state from
  `before_start` to `running`.
- POST `/races/<num>/stop` – changes race's state from
  `running` to `finished`.
- POST `/races/<num>/cancel` – changes race's state from
  `running` to `unfinished`.
- GET `/races/finished` – returns JSON of all finished races (without crossings).
- POST `/crossings/<num>/ignore` – set `ignored` field of the given
  crossing to `true`
- POST `/crossings/<num>/unignore` – set `ignored` field of the given
  crossing to `false`
- `/ws` – websocket. All connected clients will automatically receive
  updates about the current (2) race.
  - Testing: `websocat ws://localhost:4110/ws`
- `/barrier/:id` – websocket for receiving barriers data
  - Testing: `echo "{\"timestamp\":$(date +%s%6N)}"|websocat ws://localhost:4110/barrier/1`

  Note: [websocat home page][websocat]

[websocat]: https://github.com/vi/websocat

### Authorization

When `-keys` command line parameter specifies a JSON file like this:

    {
        "/barrier/1": "secretkey",
        "/barrier/2": "otherkey",
        "POST": "secret$$$$"
    }

Then all POST requests are required to have an `Authorization`
header`with correct key. This can tested with:

    curl -X POST -H "Authorization: Bearer secret$$$$" http://localhost:4110/trials/1/stop

Barriers use separate authorization keys. Example:

    echo "{\"timestamp\":$(date +%s%6N)}"|websocat ws://localhost:4110/barrier/1 -H "Authorization: secretkey"
