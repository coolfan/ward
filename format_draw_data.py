import re

FNAME_COLLEGES = "1314_college.txt"
FNAME_ROOM_BUILDING = "1314_room_building.txt"
FNAME_TIME_CLASSYEAR = "1314_time_classyear.txt"

with open(FNAME_COLLEGES) as r:
    colleges = r.read().strip().split()

with open(FNAME_ROOM_BUILDING) as r:
    text = r.read()
    data = re.split(r"(\s[A-Z]?\d{,3}[A-Z]?\s)", text.replace("\n", " "))

    # The first room/building pair aren't split properly because no preceding
    # whitespace.  Manually do it
    first_room, first_building = data[0].split()
    data = [first_room] + data
    data[1] = first_building
    data = [l.strip() for l in data]

    roomnums = data[::2]
    buildings = data[1::2]

with open(FNAME_TIME_CLASSYEAR) as r:
    text = r.read().replace("\n", " ")
    data = text.split("Apr")
    data = [("Apr" + l).strip() for l in data]
    drawtimes = [l[:-5] for l in data]
    class_years = [l[-4:] for l in data]

for row in zip(roomnums, buildings, drawtimes, class_years, colleges):
    print("\t".join(row))
