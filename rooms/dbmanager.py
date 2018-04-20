import json
import os
from functools import wraps

from flask import g
from pony.orm import Database, Required, Optional, LongStr, Json, \
    db_session, select
from pony.orm import Set as PonySet

from .conf import DB_NAME, DB_TYPE


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
            if o:
                return o

            g = Group()
            return cls(group=g, **kwargs)

    class Group(db.Entity):
        members = PonySet(User)
        favorites = PonySet("FavoriteRoom")
        requests = PonySet("GroupRequest", reverse="to_group")
        timefromstart = Optional(int)

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

        # store pictures as list of file names? vs storing as raw bytes
        pictures = Optional(str)

    class RoomDraw(db.Entity):
        draw_year = Required(int)  # Year the draw took place

        # timefromstart excludes weekends!!
        # timefromstart is the number of seconds from the start of draw
        timefromstart = Required(int)
        room = Required(Room)


def get_app_db():
    if not hasattr(g, "db_connection"):
        g.db_connection = connect()
    return g.db_connection


def use_app_db(func):
    """Decorator for functions that use the app's db"""
    @wraps(func)
    @db_session
    def wrapper(*args, **kwargs):
        # check if db exists in the app's context
        if not hasattr(g, "db_connection"):
            g.db_connection = connect()
        return func(g.db_connection, *args, **kwargs)
    return wrapper


def connect(fname: str = None,
            create_db: bool = False,
            create_tables: bool = False) -> Database:
    db = Database()
    define_entities(db)

    environment = os.environ.get('ENV', "DEVELOPMENT")
    if environment == "DEVELOPMENT":
        fname = fname if fname is not None else "rooms.sqlite"
        db.bind("sqlite", filename=fname, create_db=create_db)
        db.generate_mapping(create_tables=create_tables)
    else:
        db.bind(
            provider="mysql",
            host="publicdb",
            user="rooms_db",
            password="rooms[db]P455W0RD",
            db="rooms_db"
        )
        db.generate_mapping(create_tables=create_tables)
    return db
