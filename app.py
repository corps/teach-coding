#!/usr/bin/env python3
from sys import stdout, stdin, stderr
import pathlib
import time
import json
import os
import os.path
import select

TICK_TIME = 0.25
code_files = {f: open(os.path.join('programs', f), 'r').read() for f in os.listdir('programs') if
              os.path.isfile(os.path.join('programs', f))}

state = dict(sprites={}, tick=0, codeFiles=code_files, lastError='', serverRunning=False, lastPrint='')


def send_state():
    stdout.write(json.dumps(state) + '\n')
    stdout.flush()


def log(t):
    stderr.write(t + '\n')
    stderr.flush()


def get_sprite(sprite_id):
    log('got sprite')
    return state['sprites'].setdefault(sprite_id, dict(url='', x=0, y=0))


def position_sprite(sprite_id, x, y):
    s = get_sprite(sprite_id)
    s['x'] = x
    s['y'] = y


def draw_sprite(sprite_id, url):
    get_sprite(sprite_id)['url'] = url


def remove_sprite(sprite_id):
    if sprite_id in state['sprites']:
        del state['sprites'][sprite_id]

def print(v):
    state['lastPrint'] = repr(v)
    send_state()
    state['lastPrint'] = ''
    send_state()
    json.loads(stdin.readline().strip())

def run_program(input):
    state['serverRunning'] = True
    state['lastError'] = ''
    state['tick'] = 0
    state['sprites'] = {}

    send_state()

    try:
        p_globals = dict(
            __builtins__=dict(int=int, str=str, float=float, dict=dict, set=set),
            remove_sprite=remove_sprite,
            draw_sprite=draw_sprite,
            position_sprite=position_sprite,
            print=print,
        )

        p_locals = dict()

        try:
            exec(input['code'], p_globals, p_locals)
            if 'tick' not in p_locals or not hasattr(p_locals['tick'], '__call__'):
                raise Exception('Code must implement a function named tick')
            game_gen = p_locals['tick']()
        except Exception as e:
            state['lastError'] = str(e)
            return

        try:
            game_gen.send(None)
        except Exception as e:
            state['lastError'] = str(e)
            return

        send_state()

        while True:
            for click in input['clicks']:
                sprite_id, tick = click
                if tick < state['tick']:
                    continue

                try:
                    game_gen.send([tick, sprite_id])
                except StopIteration:
                    return
                except BaseException as e:
                    state['lastError'] = str(e)
                    return

                state['tick'] = tick

            send_state()

            time.sleep(TICK_TIME)
            state['tick'] += 1
            rd, _, _, = select.select([stdin], [], [], 0)

            if not rd:
                try:
                    game_gen.send([state['tick'], None])
                except StopIteration:
                    return
                except BaseException as e:
                    state['lastError'] = str(e)
                    return
            else:
                input = json.loads(stdin.readline().strip())
                if not input['running']:
                    return

    except StopIteration:
        pass
    except Exception:
        state['lastError'] = 'An unknown server error occurred!'
    finally:
        state['serverRunning'] = False


def process_inputs():
    while True:
        yield json.loads(stdin.readline().strip())


def open_user_state_file(input, file, mode):
    dir = f"sessions/{input['sessionId']}"
    pathlib.Path(dir).mkdir(parents=True, exist_ok=True)
    return open(os.path.join(dir, "user.json"), mode)


def main():
    for input in process_inputs():
        log(json.dumps(input))
        if not input['name']:
            continue

        if not input['sessionId']:
            continue

        if input['running']:
            run_program(input)

        with open_user_state_file(input, 'info', 'w') as f:
            f.write(json.dumps(
                dict(
                    name=input['name'],
                    sessionId=input['sessionId'],
                    lastError=state['lastError'],
                    code=input['code'],
                )))

        send_state()


send_state()
main()
