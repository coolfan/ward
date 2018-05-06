import json

import pandas as pd
import urllib.request as request


def reformat_drawtimes(in_name: str, out_name: str, n_cols=6):
    with open(in_name) as r:
        lines = r.read().splitlines(False)
    lines = lines[:-1]

    if n_cols == 6:
        headers = ["PUID", "draw_time", "group_number", "last_name", "first_name", "class_year"]
    elif n_cols == 5:
        headers = ["PUID", "draw_time", "group_number", "last_name", "first_name"]
    else:
        raise NotImplementedError("n_cols not 5 or 6???")

    rows = [lines[i:i+n_cols] for i in range(0, len(lines), n_cols)]

    df = pd.DataFrame(rows, columns=headers)

    df.to_csv(out_name, sep="\t", header=True)


def puid_to_netid(puid: str) -> str:
    url = f"https://edutools.cs.princeton.edu/integration/puid.cgi?puid={puid}"
    contents = request.urlopen(url).read()
    contents = json.loads(contents)
    return contents["netid"]


def _add_netid_column(df: pd.DataFrame):
    df["netid"] = df["PUID"].apply(puid_to_netid)


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 4:
        print("Usage: python reformat_drawtimes.py <in_name> <n_cols> <out_name>")
        print("This script takes the text copy/pasted out of the draw times"
              " pdfs and converts it to a tab separated value file.")
        print("Note: you must remove the extra headers in the txt file.  "
              "Assumes that each cell is on separate line.")
        exit(1)

    in_name, n_cols, out_name = sys.argv[1:]
    reformat_drawtimes(in_name, out_name, n_cols=int(n_cols))