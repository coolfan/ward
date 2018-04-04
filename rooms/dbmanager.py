import json
from datetime import datetime

from pony.orm import Database, Required, Optional, LongStr, Json, db_session, select
from pony.orm import Set as PonySet


def define_entities(db: Database) -> None:
    class Room(db.Entity):
        # Some rooms are reserved for freshman, disabled, etc
        # This changes year, to year however, so we will track all rooms we
        # know about, and will simply not show reserved rooms in queries.
        reserved = Required(bool)

        # Location information
        college = Required(str)
        building = Required(str)
        floor = Required(str)
        roomnum = Required(str)

        # Details
        sqft = Required(int)
        occupancy = Required(int)
        numrooms = Required(int)
        subfree = Required(bool)

        # Reverse mappings (mainly for pony.  don't remove!)
        favorites = PonySet("FavoriteRoom")
        reviews = PonySet("Review", reverse="room")
        drawings = PonySet("RoomDraw", reverse="room")

    class User(db.Entity):
        netid = Required(str)
        group = Required("Group")
        reviews = PonySet("Review", reverse="owner")
        requests = PonySet("GroupRequest", reverse="from_user")

        @classmethod
        def get_or_create(cls, **kwargs):
            o = cls.get(**kwargs)
            if o: return o

            g = Group()
            return cls(group=g, **kwargs)

    class Group(db.Entity):
        members = PonySet(User)
        favorites = PonySet("FavoriteRoom")
        requests = PonySet("GroupRequest", reverse="to_group")

    class FavoriteRoom(db.Entity):
        group = Required(Group)
        room = Required(Room)
        rank = Required(int)

    class GroupRequest(db.Entity):
        from_user = Required(User)
        to_group = Required(Group)
        message = Optional(str)
        status = Required(
            str,
            py_check=lambda s: s in {"Pending", "Approved", "Denied"}
        )

    class Review(db.Entity):
        owner = Required(User)
        room = Required(Room)
        rating = Required(int)
        text = Optional(LongStr)
        pictures = Optional(Json)  # store pictures as list of file names? vs storing as raw bytes

    class RoomDraw(db.Entity):
        draw_year = Required(int)  # Year the draw took place
        timefromstart = Required(int)  # number of seconds from the start of draw
        room = Required(Room)


def connect(fname: str,
            dbtype: str = "sqlite",
            create_db: bool = False,
            create_tables: bool = False) -> Database:
    db = Database()
    define_entities(db)
    db.bind(dbtype, filename=fname, create_db=create_db)
    db.generate_mapping(create_tables=create_tables)
    return db


@db_session
def _load_roomsjs(fname="../rooms.json"):
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


def is_number(s):
    try:
        int(s)
        return True
    except:
        return False


@db_session
def _load_drawtimes(fname="../roomdraw13.txt"):
    num_rooms_rejected = 0
    buildings = set(select(room.building for room in db.Room))
    with open(fname) as r:
        data = [l.strip().split("\t")[:3] for l in r]
        data = [
            (row[0], row[1], datetime.strptime(row[2], "%b %d, %Y %H:%M:%S %p"))
            for row in data
        ]
        draw_start = min(row[2] for row in data)
        for roomnum, building, draw_time in data:
            draw_year = draw_time.year
            timefromstart = int((draw_time - draw_start).total_seconds())

            if building == "FORBES":
                building = "Forbes College"
            # elif is_number(building):
            #     building = "Class of %s Hall" % building
            else:
                building = building[0].upper() + building[1:].lower() + " Hall"

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
    db = connect("rooms.sqlite", create_db=True, create_tables=True)
    # _load_roomsjs()
    _load_drawtimes(fname="../roomdraw16.txt")