import React, {Dispatch, ReactChild, useCallback, useEffect, useMemo, useState} from 'react';
import ReactDom from 'react-dom';
import './base.css';
import 'tachyons';
import CodeEditor from "react-simple-code-editor";
import {highlight, languages} from "prismjs/components/prism-core";
import "prismjs/components/prism-python";
import "prismjs/themes/prism.css";
import {CoolTextInput} from "./components";
import {getCookie, getSession, setCookie, setName} from "./session";
import {useSocketSync} from "./websockets";
import {Game, GameProps} from "./game"; //Example style, you can use another

const defaultServerState = {
  sprites: {} as GameProps['sprites'],
  tick: 0,
  codeFiles: {} as {[k: string]: string},
  serverRunning: false,
  lastError: '',
  lastPrint: '',
}

type ServerState = typeof defaultServerState;

function App() {
  const defaultSession = useMemo(() => {
    return getSession();
  }, []);
  const [session, setSession] = useState(defaultSession);
  const setSessionName = useCallback((name: string) => {
    setSession(setName(name));
  }, [setSession, setName]);
  const [name, sessionId] = session;
  const [running, setRunning] = useState(false);
  const [clicks, setClicks] = useState([] as [string, number][]);
  const [code, setLocalCode] = useState(() => getCookie(`${name}-${sessionId}-code`) || "");
  const [codeFile, setCodeFile] = useState("");
  const [printIdx, setPrintIdx] = useState(0);
  const setModifiedCode = useCallback((s: string) => {
    setCookie(`${name}-${sessionId}-code`, s, 365);
    setLocalCode(s);
  }, []);

  const clientState = useMemo(() => ({
    name, sessionId, clicks, running, code, printIdx
  }), [name, sessionId, clicks, running, code, printIdx]);

  const [{codeFiles, sprites, tick, serverRunning, lastError, lastPrint}, connected] = useSocketSync(clientState, defaultServerState, (a, b) => b)

  useEffect(() => {
    if (lastPrint) {
      alert(lastPrint);
      setPrintIdx(p => p + 1);
    }
  }, [lastPrint])

  useEffect(() => {
    if (!serverRunning && running) {
      setRunning(false)
    }
  }, [serverRunning])

  useEffect(() => {
    if (codeFile in codeFiles) return;
    const newCodeFile = Object.keys(codeFiles)[0];
    if (newCodeFile) setCodeFile(newCodeFile);
  }, [codeFile, codeFiles]);

  useEffect(() => {
    if (!code && codeFile in codeFiles) setLocalCode(codeFiles[codeFile])
  }, [codeFile, codeFiles])

  let inner: ReactChild | null = null;
  if (running) {
    inner = <RunGame setRun={setRunning} onClickSprite={s => setClicks(clicks => clicks.concat([s, tick]))} sprites={sprites}/>
  } else if (!name || !sessionId) {
    inner = <Login setSessionName={setSessionName}/>;
  } else if (codeFile in codeFiles) {
    inner = <Editor onSetCode={setModifiedCode} codeFiles={codeFiles}
                    lastError={lastError}
                    codeFile={codeFile} onSetCodeFile={setCodeFile}
                    setRun={setRunning} code={code}/>
  }

  return <div>
    <div className="f7 ma3">{connected ? 'connected' : 'disconnected'}</div>
    <div className="w-third mt5 center">
      {inner}
    </div>
  </div>;
}

function Login(props: { setSessionName: Dispatch<string> }) {
  return <div>
    <h3 className="h3">
      New user! Type in a username below and hit enter to start.
    </h3>
    <CoolTextInput value="" onChange={props.setSessionName} placeholder="<username>"/>
  </div>
}

interface RunGameProps extends GameProps {
  setRun: Dispatch<boolean>,
}

function RunGame({setRun, ...gameProps}: RunGameProps) {
  return <div className="f6">
    <div className="mb3">
      <span className="ml4 bg-blue white pa2 br2" onClick={() => setRun(false)}>
        Stop 🛑️
      </span>
    </div>

    <Game {...gameProps}/>
  </div>
}

interface EditorProps {
  onSetCode: Dispatch<string>,
  code: string,
  onSetCodeFile: Dispatch<string>,
  setRun: Dispatch<boolean>,
  codeFile: string,
  codeFiles: { [k: string]: string },
  lastError: string,
}

function Editor({onSetCode, setRun, codeFile, codeFiles, code, onSetCodeFile, lastError}: EditorProps) {

  return <div className="f6">
    <div className="mb3">
      File: <select onChange={(e) => onSetCodeFile(e.target.value)} value={codeFile}>
        {Object.keys(codeFiles).map(file => <option key={file} value={file}>{file}</option>)}
      </select>
      <span className="ml4 bg-blue white pa2 br2" onClick={() => setRun(true)}>
        Run ▶️
      </span>
    </div>

    { lastError && <div className="mb3 pa3 br bg-washed-red">
      {lastError}
    </div> }

    <CodeEditor
      value={code}
      onValueChange={onSetCode}
      placeholder="# python code goes here."
      highlight={(s) => (highlight(s, languages.python) + "\n").split('\n').join('<span class="nl"></span>\n')}
      padding={10}
      className="editor"
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 12,
        overflow: "visible"
      }}/>
  </div>
}

window.onload = () => {
  ReactDom.render(<App/>, document.getElementById("container"));
}