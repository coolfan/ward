import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from rooms.dbmanager import connect
from pony.orm import select, db_session

# python -m rooms.generate_db

college2building = json.load(open("college2building.json"))
building2college = {}
for c, bldgs in college2building.items():
    for b in bldgs:
        building2college[b] = c


def standardize_building(building: str) -> str:
    if building == "FORBES":
        building = "Forbes College"
    elif building == "MURLEY":
        building = "Murley-Pivirotto Hall"
    elif building == "DODGEOSBORN":
        building = "Dodge Osborn Hall"
    else:
        building = building.capitalize() + " Hall"
    return building

@db_session
def _load_roomsjs(db, fname="rooms.json"):
    with open(fname) as db_file:
        data = json.load(db_file)
        total_added = 0
        for row in data["rooms"]:
            building = row[1]
            roomnum = row[3]
            if db.Room.get(building=building, roomnum=roomnum):
                continue
            print(f"Adding {building} {roomnum}")
            total_added += 1
            room = db.Room(
                reserved=False,
                college=row[0],
                building=building,
                floor=row[2],
                roomnum=roomnum,
                sqft=int(row[4]),
                occupancy=int(row[5]),
                numrooms=int(row[6]) if row[6] else -1,
                subfree=(row[8] == "Y")
            )

        print(f"Total added: {total_added}")


@db_session
def row_to_college(db, row: pd.Series) -> str:
    roomnum = row["roomnum"]
    building = row["building"]
    room = db.Room.get(roomnum=roomnum, building=building)
    if room is not None:
        return room.college
    return ""


def compute_timefromstart(draw_time: datetime, draw_start: datetime):
    delta = draw_time - draw_start
    numweekdays = int(np.busday_count(draw_start, draw_time))
    numweekenddays = delta.days - numweekdays
    delta -= timedelta(numweekenddays, 0)
    return int(delta.total_seconds())


@db_session
def _load_draw_data(db, fname):
    # TODO: Use csv to do this more nicely
    num_rooms_rejected = 0
    df = pd.read_csv(fname, sep="\t")
    df["date"] = df["date"].apply(lambda d: datetime.strptime(d, "%b %d, %Y %H:%M:%S %p"))
    df["building"] = df["building"].apply(standardize_building)
    df["college"] = df.apply(lambda row: row_to_college(db, row), axis=1)

    # -------------------------------------------------------------------------
    # HAXXX to fix problem that we don't know what's independent for old years
    # select upper class rooms
    upperclass = df[df.college == "Upperclass"]
    # find if there are any gaps larger than 3 days
    big_gaps = upperclass["date"].diff() > timedelta(3)
    # find where that gap occurs
    gap_idx = big_gaps.idxmax()
    # Double check because of weird idxmax behavior!
    if big_gaps.loc[gap_idx] == True:
        df.loc[(df.college == "Upperclass") & (df.index < gap_idx), "college"] = "Independent"

    independent = df[df.college == "Independent"]
    big_gaps = independent["date"].diff() > timedelta(3)
    gap_idx = big_gaps.idxmax()
    if big_gaps.loc[gap_idx] == True:
        df.loc[(df.college == "Independent") & (df.index >= gap_idx), "college"] = "Upperclass"
    # -------------------------------------------------------------------------

    draws_by_college = df.groupby("college")
    for college, draws in draws_by_college:
        draw_start = draws['date'].min()
        for ix, row in draws.iterrows():
            draw_time = row['date']
            roomnum = row['roomnum']
            building = row['building']
            draw_year = draw_time.year
            timefromstart = compute_timefromstart(draw_time, draw_start)

            try:
                room = db.Room.get(building=building, roomnum=roomnum)
            except:
                print(building, roomnum)
                num_rooms_rejected += 1
                continue

            if room is None:
                # print(building, roomnum)
                num_rooms_rejected += 1
                continue

            if not db.RoomDraw.exists(draw_year=draw_year, room=room):
                db.RoomDraw(
                    draw_year=str(draw_year),
                    timefromstart=timefromstart,
                    room=room
                )
    print("Rooms rejected: %d" % num_rooms_rejected)

@db_session
def _load_curr_drawtimes(db, fname, drawtype):
    """
    :param db: 
    :param fname: e.g.: "butler_draw_times.tsv"
    :param drawtype: e.g.: Butler College
    """
    df = pd.read_csv(fname, sep="\t", index_col=0)

    df['draw_datetime'] = df['draw_time'].apply(pd.to_datetime)
    draw_start = df['draw_datetime'].min().to_pydatetime()

    by_group = df.groupby("group_number")
    for group_id, group in by_group:
        g = db.Group()
        g.drawtype = drawtype
        g.name = drawtype + " Draw Group"
        g.drawtime = group['draw_datetime'].iloc[0].to_pydatetime()
        g.timefromstart = compute_timefromstart(g.drawtime, draw_start)
        for ix, row in group.iterrows():
            netid = row["netid"]
            user = db.User.get_or_create(netid=netid)
            user.name = row["first_name"] + " " + row["last_name"]
            g.members.add(user)


@db_session
def _load_reviews(db, fname="reviews.csv"):
    df = pd.read_csv(fname)
    df = df.fillna(value="")
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
        db.Review(
            user=db.User.get(netid="tando"),
            room=room,
            rating=int(round(rating)),
            pictures="[]",
            text=text
        )


@db_session
def _load_instructor_groups(db):
    instructor_netids = ["bwk", "lumbroso", "akling", "lanceg", "jywei"]
    instructors = [
        db.User.get_or_create(netid=netid)
        for netid in instructor_netids
    ]
    drawtypes = [
        "Butler College", "Forbes College", "Independent", "Mathey College",
        "Rockefeller College", "Spelman", "Upperclass", "Whitman College",
        "Wilson College"
    ]
    for drawtype in drawtypes:
        g = db.Group()
        g.drawtype = drawtype
        g.name = drawtype + " Draw Group"


if __name__ == "__main__":
    # uncomment this and run python -m rooms.dbmanager from the first directory
    db = connect("rooms.sqlite", create_db=True, create_tables=True)
    _load_roomsjs(db, fname="./rooms.json")
    _load_draw_data(db, fname="./roomdraw16.tsv")
    _load_draw_data(db, fname="./roomdraw13.tsv")

    draws = [
        ("../2018drawdata/butler_draw_times.tsv", "Butler College"),
        ("../2018drawdata/forbes_draw_times.tsv", "Forbes College"),
        ("../2018drawdata/independent_draw_times.tsv", "Independent"),
        ("../2018drawdata/mathey_draw_times.tsv", "Mathey College"),
        ("../2018drawdata/rocky_draw_times.tsv", "Rockefeller College"),
        ("../2018drawdata/spelman_draw_times.tsv", "Spelman"),
        ("../2018drawdata/upperclass_draw_times.tsv", "Upperclass"),
        ("../2018drawdata/whitman_draw_times.tsv", "Whitman College"),
        ("../2018drawdata/wilson_draw_times.tsv", "Wilson College")
    ]

    for tsv, drawtype in draws:
        _load_curr_drawtimes(db, tsv, drawtype)
