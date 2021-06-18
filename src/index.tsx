import React, {Dispatch, ReactChild, useCallback, useMemo, useState} from 'react';
import ReactDom from 'react-dom';
import './base.css';
import 'tachyons';
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs/components/prism-core";
// import "prismjs/components/prism-python";
// import "prismjs/themes/prism.css";
import {CoolTextInput} from "./components";
import {getSession, setName} from "./session";
import {useSocketSync} from "./websockets"; //Example style, you can use another

function App() {
    const defaultSession = useMemo(() => {
        return getSession();
    }, []);
    const [session, setSession] = useState(defaultSession);
    const setSessionName = useCallback((name: string) => {
        setSession(setName(name, session[1]));
    }, [setSession, setName]);
    const [name, sessionId] = session;
    const [running, setRunning] = useState(false);
    const m = useSocketSync()

    let inner: ReactChild;
    if (!name) {
        inner = <Login setSessionName={setSessionName}/>;
    } else {
        inner = <Editor />
    }


    return <div className="w-third mt5 center">
        {inner}
    </div>
}

function Login(props: {setSessionName: Dispatch<string>}) {
    return <div>
        <h3 className="h3">
            New user!  Give yourself a login name.
        </h3>
        <CoolTextInput value="" onChange={props.setSessionName} placeholder="<username>"/>
    </div>
}

interface EditorProps {
    onSetCode: Dispatch<string>,
    onAddCodeFile: Dispatch<string>,
    setRun: Dispatch<boolean>,
    codeFile: string,
    codeFiles: {[k: string]: string},
}

function Editor({onSetCode, onAddCodeFile, setRun, codeFile, codeFiles}: EditorProps) {
    const code = codeFiles[codeFile] || "";

    return <div>

    </div>
}

window.onload = () => {
    ReactDom.render(<App/>, document.getElementById("container"));
}