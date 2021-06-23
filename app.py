#!/usr/bin/env python3
import uuid
from sys import stdout, stdin, stderr
import pathlib
import time
import json
import os
import os.path
import select
import traceback
import shutil
import hashlib
import random
import itertools

TICK_TIME = 0.25
code_files = {f: open(os.path.join('programs', f), 'r').read() for f in os.listdir('programs') if
              os.path.isfile(os.path.join('programs', f))}

state = dict(sprites={}, tick=0, codeFiles=code_files, lastError='', serverRunning=False, lastPrint='', groups={})
sessionId = ''
isAdmin = False

def send_state():
    stdout.write(json.dumps(state) + '\n')
    stdout.flush()


def log(t):
    stderr.write(t + '\n')
    stderr.flush()


def get_sprite(sprite_id):
    return state['sprites'].setdefault(sprite_id, dict(url='', x=0, y=0, text=''))

def move_sprite(sprite_id, x, y):
    s = get_sprite(sprite_id)
    s['x'] = x
    s['y'] = y

def draw_sprite(sprite_id, url):
    get_sprite(sprite_id)['url'] = url

def write(sprite_id, text):
    get_sprite(sprite_id)['text'] = text


def remove_sprite(sprite_id):
    if sprite_id in state['sprites']:
        del state['sprites'][sprite_id]


def print(v):
    state['lastPrint'] = repr(v)
    send_state()
    state['lastPrint'] = ''
    send_state()
    read_input()


def run_program(input):
    random.seed(int.from_bytes(hashlib.md5(input['sessionId'].encode("utf8")).digest(), "big") % 19239239239239)
    state['serverRunning'] = True
    state['lastError'] = ''
    state['tick'] = 0
    state['sprites'] = {}

    send_state()

    try:
        p_globals = dict(
            __builtins__=dict(
                int=int, str=str, float=float, dict=dict,
                set=set, __import__=__import__, iter=iter,
                next=next, print=print, len=len, range=range,
                random_int=random.randint, zip=zip, abs=abs,
            ),
            remove_sprite=remove_sprite,
            draw_sprite=draw_sprite,
            write=write,
            move_sprite=move_sprite,
        )

        try:
            exec(input['code'], p_globals, p_globals)
        except Exception as e:
            state['lastError'] = traceback.format_exc()
            return

        send_state()

        def run_tick():
            activity = p_globals.get('activity')
            if activity:
                try:
                    eval('next(activity)', p_globals)
                except StopIteration:
                    # p_globals['activity'] = iter([])
                    pass

            state['tick'] += 1

        acknowledged_clicks = 0
        while True:
            for click in input['clicks']:
                sprite_id, tick = click
                if tick < acknowledged_clicks:
                    continue

                while state['tick'] < tick:
                    try:
                        run_tick()
                    except Exception as e:
                        state['lastError'] = traceback.format_exc()
                        return

                acknowledged_clicks = state['tick'] + 1
                if 'handle_click' in p_globals:
                    p_globals['handle_click'](sprite_id)

            send_state()

            time.sleep(TICK_TIME)
            state['tick'] += 1
            rd, _, _, = select.select([stdin], [], [], 0)

            if not rd:
                try:
                    run_tick()
                except Exception as e:
                    state['lastError'] = traceback.format_exc()
                    return
            else:
                input = read_input()
                if not input['running']:
                    return
    except Exception as e:
        state['lastError'] = 'An unknown server error occurred!'
        log(traceback.format_exc())
    finally:
        state['serverRunning'] = False


def process_inputs():
    while True:
        yield json.loads(stdin.readline().strip())

def read_input():
    try:
        return json.loads(stdin.readline().strip())
    except ValueError:
        cleanup()
        raise

def cleanup():
    global sessionId
    if sessionId:
        dir = f"sessions/{sessionId}"
        shutil.rmtree(dir, ignore_errors=True)

def open_user_state_file(mode):
    global sessionId
    dir = f"sessions/{sessionId}"
    pathlib.Path(dir).mkdir(parents=True, exist_ok=True)
    return open(os.path.join(dir, "user.json"), mode)

def main():
    global sessionId

    while True:
        input = read_input()
        if not input['name']:
            continue

        if not input['sessionId']:
            continue

        sessionId = input['sessionId']

        if not input['group']:
            continue

        if input['running']:
            run_program(input)

        with open_user_state_file('w') as f:
            f.write(json.dumps(
                dict(
                    name=input['name'],
                    sessionId=input['sessionId'],
                    group=input['group'],
                    lastError=state['lastError'],
                    code=input['code'],
                )))

        if input['showAdmin']:
            groups = state['groups']
            groups.clear()
            for f in os.listdir("sessions"):
                try:
                    path = os.path.join("sessions", f, "user.json")
                    with open(path, "r") as f:
                        session_data = json.load(f)
                    groups.setdefault(session_data['group'], {})[session_data['sessionId']] = session_data
                except:
                    log(traceback.format_exc())
                    continue

        send_state()

send_state()
main()
