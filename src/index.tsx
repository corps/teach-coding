import React, {Dispatch, ReactChild, useCallback, useEffect, useMemo, useState} from 'react';
import ReactDom from 'react-dom';
import './base.css';
import 'tachyons';
import CodeEditor from "react-simple-code-editor";
import {highlight, languages} from "prismjs/components/prism-core";
import "prismjs/components/prism-python";
import "prismjs/themes/prism.css";
import {CoolTextInput} from "./components";
import {loadCode, loadSession, saveCode} from "./session";
import {useSocketSync} from "./websockets";
import {Game, GameProps} from "./game"; //Example style, you can use another

const defaultServerState = {
  sprites: {} as GameProps['sprites'],
  tick: 0,
  codeFiles: {} as {[k: string]: string},
  serverRunning: false,
  lastError: '',
  lastPrint: '',
  groups: {} as {[k: string]: {[k: string]: { name: string, lastError: string, code: string }}}
}

type ServerState = typeof defaultServerState;

function App() {
  const defaultSession = useMemo(() => {
    return loadSession();
  }, []);
  const [session, setSession] = useState(defaultSession);
  const {name, sessionId, group} = session;
  const setSessionName = useCallback((name: string) => {
    setSession(({ sessionId, group }) => ({ name, sessionId, group }));
  }, [setSession]);
  const setGroup = useCallback((group: string) => {
    setSession(({ sessionId, name }) => ({ name, sessionId, group }));
  }, [setSession])

  const [showAdmin, setShowAdmin] = useState(false);
  const [running, setRunning] = useState(false);
  const [clicks, setClicks] = useState([] as [string, number][]);
  const startRunning = useCallback(() => {
    setRunning(true);
    setClicks([]);
  }, [setRunning, setClicks]);
  const [code, setLocalCode] = useState("");
  const [codeFile, setCodeFile] = useState("");
  const [pollIdx, setPollIdx] = useState(0);
  const setModifiedCode = useCallback((s: string) => {
    saveCode(codeFile, s);
    setLocalCode(s);
  }, []);

  const clientState = useMemo(() => ({
    name, sessionId, clicks, running, code, pollIdx, group, showAdmin
  }), [name, sessionId, clicks, running, code, pollIdx, group, showAdmin]);

  const [{codeFiles, sprites, tick, serverRunning, lastError, lastPrint, groups}, connected] = useSocketSync(clientState, defaultServerState, (a, b) => b)

  useEffect(() => {
    if (showAdmin) {
      const poller = setInterval(() => setPollIdx(idx => idx + 1), 1000);
      return () => {
        clearInterval(poller);
      }
    }

    return () => null
  }, [showAdmin])

  useEffect(() => {
    if (lastPrint) {
      alert(lastPrint);
      setPollIdx(p => p + 1);
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
    if (!code && codeFile in codeFiles) {
      setLocalCode(loadCode(codeFile) || codeFiles[codeFile])
    }
  }, [codeFile, codeFiles])

  const resetCode = useCallback(() => {
    setModifiedCode(codeFiles[codeFile]);
  }, [setModifiedCode, codeFile, codeFiles]);

  let inner: ReactChild | null = null;
  if (running) {
    inner = <RunGame setRun={setRunning} onClickSprite={s => setClicks(clicks => clicks.concat([[s, tick]]))} sprites={sprites}/>
  } else if (!name || !sessionId || !group) {
    inner = <Login setSessionName={setSessionName} setGroup={setGroup} name={name}/>;
  } else if (showAdmin) {
    inner = <Admin groups={groups} onSetCode={setModifiedCode} setShowAdmin={setShowAdmin}/>;
  } else if (codeFile in codeFiles) {
    inner = <Editor onSetCode={setModifiedCode} codeFiles={codeFiles}
                    lastError={lastError} resetCode={resetCode}
                    codeFile={codeFile} onSetCodeFile={setCodeFile}
                    setShowAdmin={setShowAdmin} group={group}
                    setRun={startRunning} code={code}/>
  }

  return <div>
    <div className="f7 ma3">{connected ? 'connected' : 'disconnected'}</div>
    <div className="w-third mt5 center">
      {inner}
    </div>
  </div>;
}

function Login(props: { setSessionName: Dispatch<string>, setGroup: Dispatch<string>, name: string | null }) {
  if (!props.name) {
    return <div>
      <h3 className="h3">
        New user! Type in a username below and hit enter to start.
      </h3>
      <CoolTextInput  key="name" value="" onChange={props.setSessionName} placeholder="username"/>
    </div>
  } else {
    return <div>
      <h3 className="h3">
        Ok {props.name}, which group did your instructor assign you?
      </h3>
      <CoolTextInput key="group" value="" onChange={props.setGroup} placeholder="group"/>
    </div>
  }
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

interface AdminProps {
  groups: ServerState['groups'],
  onSetCode: Dispatch<string>,
  setShowAdmin: Dispatch<boolean>,
}

function Admin({ groups, onSetCode, setShowAdmin }: AdminProps) {
  return <div className="f6">
    <div className="mb3">
      <span className="ml4 bg-blue white pa2 br2" onClick={() => setShowAdmin(false)}>
        Return
      </span>
    </div>
    {Object.keys(groups).map(groupName => {
      const group = groups[groupName];
      return <div key={groupName}>
        <h3>{groupName}</h3>
        <ul>
          {Object.keys(group).map(sessionId => {
            const {name, lastError, code} = group[sessionId];
            return <li key={sessionId} onClick={() => onSetCode(code)}>
              {name}<br/>
              { lastError && <pre className="mb3 pa3 br bg-washed-red">{lastError}</pre> }
            </li>
          })}
        </ul>
      </div>
    })}
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
  resetCode: Dispatch<any>,
  setShowAdmin: Dispatch<boolean>,
  group: string,
}

function Editor({onSetCode, setRun, codeFile, codeFiles, code, onSetCodeFile, lastError, resetCode, setShowAdmin, group}: EditorProps) {

  return <div className="f6">
    <div className="mb3">
      File: <select onChange={(e) => onSetCodeFile(e.target.value)} value={codeFile}>
        {Object.keys(codeFiles).map(file => <option key={file} value={file}>{file}</option>)}
      </select>
      <span className="ml4 bg-blue white pa2 br2" onClick={() => resetCode(null)}>
        Reset Code ↺️
      </span>
      <span className="ml4 bg-blue white pa2 br2" onClick={() => setRun(true)}>
        Run ▶️
      </span>
      { group === "admin" && <span className="ml4 bg-yellow white pa2 br2" onClick={() => setShowAdmin(true)}>
        Admin
      </span> }
    </div>

    { lastError && <pre className="mb3 pa3 br bg-washed-red">
      {lastError}
    </pre> }

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