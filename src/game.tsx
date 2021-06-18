import {Dispatch, useEffect, useMemo, useState} from "react";

type Action<T extends string, P> = { type: T, payload: P };
type GameAction =
    Action<'remove', { id: string }> |
    Action<'update', { id: string, sprite: Partial<Sprite> }>;
type GameEvent = [GameAction, number];

type UserInput = Action<'click', { id: string }>;
type UserInteraction = [UserInput, number];

interface Sprite {
    img: string,
    x: number,
    y: number,
}

const defaultSprite: Sprite = {
    img: "",
    x: 0, y: 0,
}

export interface GameSyncState {
    events: GameEvent[],
    tick: number,
}

export const defaultGameSyncState: GameSyncState = {
    events: [],
    tick: 0,
}

interface GameProps {
    queueInteraction: Dispatch<UserInteraction>,
    syncState: GameSyncState,
    onUpdateSyncState: Dispatch<GameSyncState>,
}

export function Game({queueInteraction, syncState, onUpdateSyncState}: GameProps) {
    const {events, tick} = syncState;
    const [sprites, setSprites] = useState<{ [k: string]: Sprite }>({});
    const [startTime, _] = useState(() => Date.now() - tick);

    useEffect(() => {
        const timer = setInterval(() => {
            const tick = Date.now() - startTime;
            let idx = events.findIndex(([_, when]) => when > tick);
            idx = idx === -1 ? idx = events.length : idx;

            if (idx > 0) {
                events.slice(0, idx).forEach(([event]) => {
                    if (event.type === "update") {
                        setSprites(sprites => ({
                            ...sprites,
                            [event.payload.id]: {...defaultSprite, ...event.payload.sprite}
                        }));
                    } else if (event.type === "remove") {
                        setSprites(sprites => {
                            const newSprites = {...sprites};
                            delete newSprites[event.payload.id];
                            return newSprites;
                        });
                    }
                });
            }
        }, 100);

        return () => clearInterval(timer);
    })
}