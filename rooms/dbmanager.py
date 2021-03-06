import os
from datetime import datetime
from functools import wraps

from flask import g
from pony.orm import Database, Required, Optional, LongStr, db_session, PrimaryKey, Set, exists

from rooms.likelihood import likelihood


def define_entities(db: Database) -> None:
    class Room(db.Entity):
        id = PrimaryKey(int, auto=True)
        reserved = Required(bool)
        college = Required(str)
        building = Required(str)
        floor = Required(str)
        roomnum = Required(str)
        sqft = Required(int)
        occupancy = Required(int)
        numrooms = Required(int)
        subfree = Required(bool)
        ranked_rooms = Set('RankedRoom')
        reviews = Set('Review')
        room_draws = Set('RoomDraw')

        def getdraw(self):
            """Returns the draw type of the room"""
            if self.building == "Spelman":
                return "Spelman"
            return self.college

        def to_dict(self, user=None):
            d = super(Room, self).to_dict()
            # draw = self.getdraw()
            # if len(draw.split()) == 2:
            #     draw = draw.replace(" College", "")
            # d["college"] = draw

            if user is not None:
                d['favorited'] = self in user.getfavoritelist()
                d['likelihood'] = likelihood(user, self)
            else:
                d['favorited'] = False
                d['likelihood'] = 50
            return d

    class RankedRoom(db.Entity):
        id = PrimaryKey(int, auto=True)
        creator = Required('User', reverse="ranked_rooms")
        room = Required(Room)

        ranked_room_list = Required('RankedRoomList')
        rank = Required(int)

        def to_dict(self, user=None):
            d = self.room.to_dict(user=user)
            d['creator'] = self.creator.netid
            if self.creator.name:
                d['creator'] = self.creator.name
            return d

    class RankedRoomList(db.Entity):
        id = PrimaryKey(int, auto=True)
        name = Optional(str)
        ranked_rooms = Set(RankedRoom)
        shared_with_users = Set('User')
        shared_with_groups = Set('Group')

        def __contains__(self, item):
            if isinstance(item, Room):
                for rr in self.ranked_rooms:
                    if rr.room == item: return True
            return False

        def get_by_room(self, room):
            for rr in self.ranked_rooms:
                if rr.room == room: return rr
            return None

        def remove(self, room):
            rr = self.get_by_room(room)
            if rr is None: return
            deleted_rank = rr.rank
            rr.delete()
            for rr in self.ranked_rooms:
                if rr.rank > deleted_rank:
                    rr.rank -= 1

    class User(db.Entity):
        id = PrimaryKey(int, auto=True)
        netid = Required(str, unique=True)
        name = Optional(str, default="")

        ranked_room_lists = Set(RankedRoomList)
        groups = Set('Group')
        requests_made = Set('GroupRequest')
        reviews = Set('Review')
        group_invites = Set('GroupInvite')

        ranked_rooms = Set(RankedRoom, reverse="creator")

        @classmethod
        def get_or_create(cls, **kwargs):
            o = cls.get(**kwargs)
            if o:
                return o
            u = cls(**kwargs)
            u.ranked_room_lists.create(name="Personal Favorites")
            return u

        def getfavoritelist(self, room=None):
            if room is not None:
                group = self.getgroup(room)
                if group: return group.getfavoritelist()
                return None
            rrls = self.ranked_room_lists.select()[:]
            if len(rrls) > 0:
                return rrls[0]
            else:
                self.ranked_room_lists.create()
                return self.ranked_room_lists.select()[:][0]

        def getgroup(self, room):
            drawtype = room.getdraw()
            for group in self.groups:
                if group.drawtype == drawtype:
                    return group
            return None

    class Group(db.Entity):
        id = PrimaryKey(int, auto=True)
        members = Set(User)
        name = Optional(str)

        drawtype = Optional(str)
        drawtime = Optional(datetime)
        timefromstart = Optional(int)

        ranked_room_lists = Set(RankedRoomList)
        group_requests = Set('GroupRequest')
        invites_made = Set('GroupInvite')

        def getfavoritelist(self):
            rrls = self.ranked_room_lists.select()[:]
            if len(rrls) > 0: return rrls[0]
            else:
                self.ranked_room_lists.create()
                return self.ranked_room_lists.select()[:][0]

        def to_dict(self, netid=""):
            d = super(Group, self).to_dict()
            d["members"] =[
                member.name if member.name else member.netid
                for member in self.members
                if member.netid != netid
            ]
            d["members"] = sorted(d["members"])
            d["drawtime"] = self.drawtime.strftime("%a, %m/%d/%y %I:%M %p")
            return d

    class Review(db.Entity):
        id = PrimaryKey(int, auto=True)
        user = Required(User)
        room = Required(Room)
        rating = Required(int)
        text = Optional(LongStr)
        pictures = Optional(str)

    class RoomDraw(db.Entity):
        id = PrimaryKey(int, auto=True)
        draw_year = Required(int)
        timefromstart = Required(int)
        room = Required(Room)

    class GroupRequest(db.Entity):
        id = PrimaryKey(int, auto=True)
        message = Optional(str)
        from_user = Required(User)
        status = Required(str, py_check=lambda s: s in {"Pending", "Approved", "Denied"})
        to_group = Required(Group)

    class GroupInvite(db.Entity):
        id = PrimaryKey(int, auto=True)
        to_user = Required(User)
        from_group = Required(Group)
        message = Optional(str)
        status = Required(str, py_check=lambda s: s in {"Pending", "Approved", "Denied"})


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
            user="tando",
            password="rooms[db]P455W0RD",
            db="rooms_db"
        )
        db.generate_mapping(create_tables=create_tables)
    return db
