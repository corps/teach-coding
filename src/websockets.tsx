import {useCallback, useEffect, useMemo, useState} from "react";

const host = location.host + (location.port ? ':' + location.port : '');

export function useSockets(cb: () => void) {
    const [socket, setSocket] = useState(new WebSocket('ws://' + host + '/'));

    useEffect(() => {
        return () => {
            socket.close();
            cb();
        };
    }, [socket]);

    const send = useCallback((data: Object) => socket.send(JSON.stringify(data)), [socket]);
    socket.op
}

// var ws = new WebSocket('ws://localhost:8080/');
// ws.onopen    = function() { ... do something on connect ... };
// ws.onclose   = function() { ... do something on disconnect ... };
// ws.onmessage = function(event) { ... do something with event.data ... };