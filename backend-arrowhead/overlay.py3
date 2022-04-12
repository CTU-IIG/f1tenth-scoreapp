#!/usr/bin/env python3
# overlay.py3
"""Arrowhead Compliant overlay."""

######################
# Arrowhead Configuration
######################

from aclpy.client.client_pkcs12 import ArrowheadClient
from aclpy.interface import ArrowheadInterface
from aclpy.server import ArrowheadServer
from aclpy.service import ArrowheadService

exec(open("ahconf.py", "rb").read())
"""Expected contents:
Server = ArrowheadServer(
    address = AH_CORE_IP_ADDRESS,
)

Interface = ArrowheadInterface(
    name = NAME_OF_THE_INTERFACE,
)

Service = ArrowheadService(
    name = NAME_OF_THE_SERVICE,
)

Client = ArrowheadClient(
    name = NAME_OF_THE_SYSTEM,
    address = SYSTEM_IP_ADDRESS,
    port = SYSTEM_PORT,
    pubfile = PATH_TO_PUB_FILE,
    p12file = PATH_TO_P12_FILE,
    p12pass = PASS_TO_P12_FILE,
    cafile = PATH_TO_CA_FILE,
    server = Server,
    interfaces = [Interface],
)
"""

import signal

def exit_sequence(sig, frame):
    Client.unregister_service(Service)


signal.signal(signal.SIGTERM, exit_sequence)

######################
# Arrowhead Sequence
######################

import time, os

if not Client.register_service(Service):
    Client.unregister_service(Service)

    if not Client.register_service(Service):
        print (Client.last_error)
        exit (1)

print ("Registered to AHCore with:\n\tInterface ID: %d\n\tProvider ID: %d\n\tService ID: %d" % (Interface.id, Client.id, Service.id))

os.system("../backend/scoreapp")

exit_sequence(signal.SIGTERM, None)
