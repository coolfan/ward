import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from rooms.dbmanager import connect
from pony.orm import select, db_session

# python -m rooms.generate_db

college2building = json.load(open("../college2building.json"))
building2college = {}
for c, bldgs in college2building.items():
    for b in bldgs:
        building2college[b] = c


def standardize_building(building: str) -> str:
    if building == "FORBES":
        building = "Forbes College"
    else:
        building = building.capitalize() + " Hall"
    return building

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


@db_session
def _load_drawtimes(db, fname):
    # TODO: Use csv to do this more nicely
    num_rooms_rejected = 0
    df = pd.read_csv(fname, sep="\t")
    df["date"] = df["date"].apply(lambda d: datetime.strptime(d, "%b %d, %Y %H:%M:%S %p"))
    df["building"] = df["building"].apply(standardize_building)
    df["college"] = df["building"].apply(lambda b: building2college[b])

    draws_by_college = db.groupby("college")
    for college, draws in draws_by_college
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


def _load_reviews(db, fname="reviews.csv"):
    df = pd.read_csv(fname)
    missed = []
    for ix, row in df.iterrows():
        tokens = row["room_name"].split()
        roomnum = tokens[-1]
        tokens = tokens[:-1]

        if "Hall" in tokens:
            hall = " ".join(tokens)
        else:
            tokens.append("Hall")
            hall = " ".join(tokens)
        room = db.Room.get(building=hall, roomnum=roomnum)

        if room is None:
            print(f"{hall} | {roomnum}")
            missed.append((ix, row))
            continue
        rating = sum(row[["bunk_beds", "lighting", "bathrooms", "kitchens", "facilities", "heating"]]) / 6
        text = row["text"]
        db.Review(owner=db.User.get(netid="tando"), room=room, rating=int(round(rating)), text=text)


if __name__ == "__main__":
    # uncomment this and run python -m rooms.dbmanager from the first directory
    db = connect("rooms.sqlite", create_db=True, create_tables=True)
    _load_roomsjs(db)
    _load_drawtimes(db, fname="roomdraw16.txt")
    _load_drawtimes(db, fname="roomdraw13.txt")
    pass
