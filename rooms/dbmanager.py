from pony.orm import Database, Required
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

    class User(db.Entity):
        netid = Required(str)
        group = Required("Group")

    class Group(db.Entity):
        members = PonySet(User)
        favorites = PonySet("FavoriteRoom")

    class FavoriteRoom(db.Entity):
        group = Required(Group)
        room = Required(Room)
        rank = Required(int)


def connect(fname: str,
            dbtype: str = "sqlite",
            create_db: bool = False,
            create_tables: bool = False) -> Database:
    db = Database()
    define_entities(db)
    db.bind(dbtype, filename=fname, create_db=create_db)
    db.generate_mapping(create_tables=create_tables)
    return db
