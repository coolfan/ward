import os

import logging

# -----------------------------------------------------------------------------
# GENERAL CONFIG
# -----------------------------------------------------------------------------

DB_NAME = "rooms.sqlite"
DB_TYPE = "sqlite"

# -----------------------------------------------------------------------------
# LOGGING RELATED CONFIG
# -----------------------------------------------------------------------------

LOGGER = "rooms_logger"
logger = logging.getLogger(LOGGER)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

handler = logging.FileHandler("rooms.log")
handler.setLevel(level=logging.DEBUG)
handler.setFormatter(formatter)
logger.addHandler(handler)


# -----------------------------------------------------------------------------
# CAS CONFIG
# -----------------------------------------------------------------------------

CAS_URL = "https://fed.princeton.edu/cas/"