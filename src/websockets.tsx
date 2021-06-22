import {useEffect, useState} from "react";

export function useSocketSync<S extends Object, T>(state: S, defaultServerState: T, concat: (a: T, b: T) => T): [T, boolean] {
    const [socket, setSocket] = useState(() => new WebSocket('ws://' + location.host + '/'));
    const [serverState, setServerState] = useState(() => defaultServerState);
    const [opened, setOpened] = useState(false);
    const [failures, setFailures] = useState(0);
    const [nextReconnect, setNextReconnect] = useState(1 as any as NodeJS.Timeout);

    useEffect(() => {
        console.log('reconnecting...', failures);
        setOpened(false)
        socket.onopen = () => { setOpened(true); setFailures(1); };
        socket.onerror = (e) => console.error(e);
        socket.onclose = (e) => {
          if (e.code == 1000) return;
          setNextReconnect(() => setTimeout(() => setSocket(new WebSocket('ws://' + location.host + '/')), failures ** 2 * 100));
          setFailures(f => f + 1);
        };

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setServerState(concat(serverState, data));
        }

        return () => {
            setOpened(false);
            socket.close();
            clearTimeout(nextReconnect);
        };
    }, [socket, setSocket]);

    useEffect(() => {
        if (opened) socket.send(JSON.stringify(state));
    }, [state, opened])

    return [serverState, opened];
}