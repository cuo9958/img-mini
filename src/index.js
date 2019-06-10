import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Finger from "fingerprintjs2";
// import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

Finger.get({}, function (data) {
    const values = data.map(function (c) { return c.value })
    const uid = Finger.x64hash128(values.join(''), 31);
    console.log("设备指纹", uid)
    localStorage.setItem("uid", uid);
})
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
