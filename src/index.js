import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages';
import AV from 'leancloud-storage';
// import * as serviceWorker from './serviceWorker';

AV.init({
    appId: "0RNm5tvcxjNom8inbeu9jD9l-gzGzoHsz",
    appKey: "iJwbBLQWJoy18aJHaGPRjTTO"
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
