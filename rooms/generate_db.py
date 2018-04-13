import json
import numpy as np
from datetime import datetime, timedelta

from rooms.dbmanager import connect
from pony.orm import select, db_session

# python -m rooms.generate_db

@db_session
def _load_roomsjs(db, fname="rooms.json"):
    with open(fname) as db_file:
        data = json.load(db_file)
        for row in data["rooms"]:
            room = db.Room(
                reserved=False,
                college=row[0],
                building=row[1],
                floor=row[2],
                roomnum=row[3],
                sqft=int(row[4]),
                occupancy=int(row[5]),
                numrooms=int(row[6]),
                subfree=(row[7] == "Y")
            )
#
#
# def is_number(s):
#     return isinstance(s, Integral)


@db_session
def _load_drawtimes(db, fname):
    # TODO: Use csv to do this more nicely
    num_rooms_rejected = 0
    buildings = set(select(room.building for room in db.Room))
    with open(fname) as r:
        data = [l.strip().split("\t")[:3] for l in r]
        time_format = "%b %d, %Y %H:%M:%S %p"
        data = [
            (row[0], row[1], datetime.strptime(row[2], time_format))
            for row in data
        ]
        draw_start = min(row[2] for row in data)
        for roomnum, building, draw_time in data:
            draw_year = draw_time.year
            delta = draw_time - draw_start
            numweekdays = int(np.busday_count(draw_start, draw_time))
            numweekenddays = delta.days - numweekdays
            delta -= timedelta(numweekenddays, 0)
            timefromstart = int(delta.total_seconds())

            if building == "FORBES":
                building = "Forbes College"
            else:
                building = building.capitalize() + " Hall"

            room = db.Room.get(building=building, roomnum=roomnum)
            if room is None:
                print(building, roomnum)
                num_rooms_rejected += 1
                continue
            if not db.RoomDraw.exists(draw_year=draw_year, room=room):
                db.RoomDraw(
                    draw_year=str(draw_year),
                    timefromstart=timefromstart,
                    room=room
                )
    print("Rooms rejected: %d" % num_rooms_rejected)


if __name__ == "__main__":
    # uncomment this and run python -m rooms.dbmanager from the first directory
    db = connect("rooms.sqlite", create_db=True, create_tables=True)
    _load_roomsjs(db)
    _load_drawtimes(db, fname="roomdraw16.txt")
    _load_drawtimes(db, fname="roomdraw13.txt")
    pass
