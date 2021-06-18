import React, {useState} from 'react';
import ReactDom from 'react-dom';
import './base.css';
import 'tachyons';
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs/components/prism-core";
// import "prismjs/components/prism-python";
// import "prismjs/themes/prism.css";
import {CoolTextInput} from "./components"; //Example style, you can use another

function App() {
    const [name, setName] = useState("");

    return <div className="w-third mt5 center">
        <CoolTextInput value={name} onChange={setName} placeholder="Username?"/>
    </div>
}

window.onload = () => {
    ReactDom.render(<App/>, document.getElementById("container"));
}