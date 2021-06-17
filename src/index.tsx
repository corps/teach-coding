import React from 'react';
import ReactDom from 'react-dom';

function App() {
    return <div>
        Hello world!
    </div>
}

document.onloadeddata = () => {
    ReactDom.render(<App/>, document.getElementById("#container"));
}