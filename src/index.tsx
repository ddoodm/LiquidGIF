import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Canvas } from './canvas';

const App = () => {
    return (
        <div>
            <h1>Hello World from React and TypeScript!</h1>
            <Canvas />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
