#!/usr/bin/env python3
# overlay.py3
"""Arrowhead Compliant overlay."""
######################
# Logo
######################

from PIL import Image
# https://stackoverflow.com/questions/68957686/pillow-how-to-binarize-an-image-with-threshold
arrowhead_logo = Image.open("arrowhead_logo.bmp") \
                      .convert("L") \
                      .point( lambda p: 255 if p > 20 else 0 ) \
                      .convert("1") \
                      .resize((16, 9))

import sys

def show_arrowhead_logo():
    for y in range(arrowhead_logo.height):
        for x in range(arrowhead_logo.width):
            if arrowhead_logo.getpixel((x, y)):
                sys.stdout.write("#")
            else:
                sys.stdout.write(" ")
        print("")


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

    exit(0)


signal.signal(signal.SIGTERM, exit_sequence)

######################
# Arrowhead Sequence
######################

import time, os

show_arrowhead_logo()
print ("Arrowhead backend overlay starting up...\n")

print ("Registering '%s' service to Arrowhead Core..." % Service.name)
if not Client.register_service(Service):
    Client.unregister_service(Service)

    if not Client.register_service(Service):
        print (Client.last_error)
        exit (1)

print ("> Registration successful.")
print ("> Interface ID: %d\n> Provider ID: %d\n> Service ID: %d\n" % (Interface.id, Client.id, Service.id))

print ("Starting scoreapp...")
os.system("../../backend/scoreapp")

exit_sequence(signal.SIGTERM, None)
