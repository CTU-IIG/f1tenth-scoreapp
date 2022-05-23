# f1tenth-scoreapp-backend-arrowhead
_An Arrowhead compliant overlay for backend._

This application serves as an Arrowhead overlay for the **F1Tenth Scoreapp** (backend). It registers itself as an Arrowhead Service `scoreapp` and launches the backend scoreapp itself. Provided Service is consumed by the optical barriers.

The Service `scoreapp` provided by this overlay has following metadata:
- `authorization` -- secret keyphrase for authorizing the barrier (it is used by the barrier to authorize itself with the scoreapp)
- `endpoint_X` -- available endpoint for the barrier to connect to

_Note: The amount of endpoints is not limited. Each parameter starting with `endpoint_` should be treated as an endpoint option._


## Requirements
- `aclpy >= 0.2.0`
  - GitHub: [https://github.com/CTU-IIG/ah-acl-py](https://github.com/CTU-IIG/ah-acl-py)
  - Wheel: [v0.2.0](https://github.com/jara001/ah-acl-py/releases/download/v0.2.0/aclpy-0.2.0-py3-none-any.whl)


## Usage

1. Obtain certificates (`.p12`, `.pub`) for your system from your local Arrowhead Core.
2. Obtain also the certificate authority `.ca` for your cloud.
3. Create a configuration file `ahconf.py`.
4. Run the `overlay.py3`.


## Configuration example

```python
Server = ArrowheadServer(
    address = "192.168.1.22",
)

Interface = ArrowheadInterface(
    name = "HTTP-INSECURE-JSON",
)

Service = ArrowheadService(
    name = "scoreapp",
    metadata = {
        "authorization": "secret",
        "endpoint_1": "barrier/1",
        "endpoint_2": "barrier/2",
    },
)

Client = ArrowheadClient(
    name = "overlay",
    address = "192.168.12.22",
    port = 4110,
    p12file = "overlay.p12",
    p12pass = "SomeSecurePassword",
    cafile = "authority.ca",
    server = Server,
    interfaces = [Interface],
)
```
