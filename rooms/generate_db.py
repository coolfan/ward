import json
from datetime import datetime

from pony.orm import db_session

from rooms.dbmanager import connect


db = connect("rooms.sqlite", create_db=True, create_tables=True)


if __name__ == '__main__':
    load_roomsjs()
