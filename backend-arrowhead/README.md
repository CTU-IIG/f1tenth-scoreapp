# f1tenth-scoreapp-backend-arrowhead
_An Arrowhead compliant overlay for backend._


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
