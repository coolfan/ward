import json

from pony.orm import db_session

from dbmanager import connect


db = connect("rooms.sqlite")


@db_session
def load_roomsjs(fname="rooms.json"):
    with open(fname) as db_file:
        data = json.load(db_file)
        for row in data["rooms"]:
            room = db.Room(
                college=row[0],
                building=row[1],
                floor=row[2],
                roomnum=row[3],
                sqft=int(row[4]),
                occupancy=int(row[5]),
                numrooms=int(row[6]),
                subfree=(row[7] == "Y")
            )


if __name__ == '__main__':
    load_roomsjs()
