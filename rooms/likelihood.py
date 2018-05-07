import numpy as np
import scipy.stats
from flask import current_app


def likelihood(user, room) -> int:
    """
    :param user: db.User logged in
    :param room: db.Room in question
    :return: integer 0 - 100 % chance you'll draw the room
    """
    if user is None: return 50
    if len(user.groups) == 0: return 50

    group = user.getgroup(room)
    if group is None: return -1

    my_time = group.timefromstart
    if my_time is None: return 50

    times = [d.timefromstart for d in room.room_draws]
    if len(times) == 0: return 50

    mean = np.mean(times)
    stddev = np.std(times)
    current_app.logger.debug(f"{room.building} {room.roomnum} | Mean: {mean}, Std: {stddev}, Your time: {my_time}")
    stddev = stddev if stddev > 0.0 else 5*60*60
    prob = 1.0 - scipy.stats.norm.cdf(my_time, mean, stddev)
    prob = int(prob * 100.0)
    return min(max(2, prob), 98)