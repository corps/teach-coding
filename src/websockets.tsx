import {Dispatch, useCallback, useEffect, useMemo, useState} from "react";

const host = location.host + (location.port ? ':' + location.port : '');

export function useSocketSync<S, T>(state: S, defaultServerState: T, concat: (a: T, b: T) => T) {
    const [socket, setSocket] = useState(new WebSocket('ws://' + host + '/'));
    const [serverState, setServerState] = useState(() => defaultServerState);

    useEffect(() => {
        socket.onerror = (e) => console.error(e);
        socket.onclose = (e) => e.code !== 1000 ? setSocket(new WebSocket('ws://' + host + '/')) : null;
        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setServerState(concat(serverState, data));
        }

        return () => {
            socket.close();
        };
    }, [socket, setSocket]);

    useEffect(() => {
        socket.send(JSON.stringify(state));
    }, [state])

    return serverState;
}

//

// var ws = new WebSocket('ws://localhost:8080/');
// ws.onopen    = function() { ... do something on connect ... };
// ws.onclose   = function() { ... do something on disconnect ... };
// ws.onmessage = function(event) { ... do something with event.data ... };