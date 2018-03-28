from pony.orm import Database, Required, Optional, LongStr
from pony.orm import Set as PonySet


def define_entities(db: Database) -> None:
    class Room(db.Entity):
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
        status = Required(str)  # Pending, Approved, Denied

    class Review(db.Entity):
        owner = Required(User)
        room = Required(Room)
        rating = Required(int)
        text = Optional(LongStr)
        # pictures = PonySet(str)  # store pictures as list of file names

def connect(fname: str,
            dbtype: str = "sqlite",
            create_db: bool = False,
            create_tables: bool = False) -> Database:
    db = Database()
    define_entities(db)
    db.bind(dbtype, filename=fname, create_db=create_db)
    db.generate_mapping(create_tables=create_tables)
    return db


if __name__ == "__main__":
    db = connect("rooms.sqlite", create_db=True, create_tables=True)