import React from 'react';
import { Button, Input } from 'antd';
const { TextArea } = Input;

import image_screen from '../public/screen.png'

function App() {
  return (
    <div>
      <div style={{ width: '100%', height: "500px", backgroundColor: 'gray', display: 'flex' }}>
        <div style={{ width: '50%', height: "100%", backgroundColor: 'blue' }}>
          <Button style={{ width: '25%', height: "10%", float: 'right' }}>Refresh</Button>
          <Button style={{ width: '25%', height: "10%", float: 'right' }}>Tap By Coordinates</Button>
          <Button style={{ width: '25%', height: "10%", float: 'right' }}>Swipe By Coordinates</Button>
          <Button style={{ width: '25%', height: "10%", float: 'right' }}>Select Elements</Button>
          <img src={image_screen} style={{ width: '100%', height: "90%" }} />
        </div>
        <div style={{ width: '50%', height: "100%", backgroundColor: 'red' }}>
          <div style={{ width: '100%', height: "10%" }}>
            <Input style={{ width: '20%', height: "100%" }} placeholder="App" />
            <Input style={{ width: '20%', height: "100%" }} placeholder="Activity" />
            <Input style={{ width: '20%', height: "100%" }} placeholder="Package" />
            <Button style={{ width: '15%', height: "100%", float: 'right' }}>Run Script</Button>
            <Button style={{ width: '15%', height: "100%", float: 'right' }}>Create Session</Button>
          </div>
          <TextArea style={{ width: '100%', height: "90%" }} />
        </div>
      </div >
      <div style={{ width: '100%', height: "500px", backgroundColor: 'gray', display: 'flex' }}>
        <div style={{ width: '50%', height: "100%", backgroundColor: 'yellow' }}>elements</div>
        <div style={{ width: '50%', height: "100%", backgroundColor: 'green' }}>log</div>
      </div >
    </div>
  );
}

export default App;
