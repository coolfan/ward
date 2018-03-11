from pony.orm import Database, Required


def define_entities(db: Database):
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

    


def connect(fname: str, dbtype: str="sqlite"):
    db = Database()
    define_entities(db)
    db.bind(dbtype, filename=fname, create_db=True)
    db.generate_mapping(create_tables=True)
    return db