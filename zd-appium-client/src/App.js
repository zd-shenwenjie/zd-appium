import React, { Component } from 'react';
import { Button, Input } from 'antd';
const { TextArea } = Input;

import image_screen from '../public/screen.png'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      touch: 'select',
      app: '',
      activity: '',
      package: '',
      script: ''
    }
  }

  componentDidMount() {
    this.screen.focus();
    const top = this.screen.getBoundingClientRect().top;
    const bottom = this.screen.getBoundingClientRect().bottom;
    const left = this.screen.getBoundingClientRect().left;
    const right = this.screen.getBoundingClientRect().right;
    const x = left + document.documentElement.scrollLeft;
    const y = top + document.documentElement.scrollTop;
    const w = right - left;
    const h = bottom - top;

    console.log(x, y, w, h);
  }

  render() {
    return (
      <div>
        <div style={{ width: '100%', height: "500px", display: 'flex' }}>
          <div style={{ width: '50%', height: "100%" }}>
            <Button style={{ width: '25%', height: "10%", float: 'right' }} onClick={this.handleRefreshScreen.bind(this)}>Refresh</Button>
            <Button style={{ width: '25%', height: "10%", float: 'right' }} onClick={this.handleChangeTouchEventAsSwipe.bind(this)} > Swipe By Coordinates</Button>
            <Button style={{ width: '25%', height: "10%", float: 'right' }} onClick={this.handleChangeTouchEventAsTap.bind(this)} > Tap By Coordinates</Button>
            <Button style={{ width: '25%', height: "10%", float: 'right' }} onClick={this.handleChangeTouchEventAsSelect.bind(this)} > Select Elements</Button>
            <img src={image_screen} style={{ width: '100%', height: "90%" }} onMouseDown={this.handleMouseDownScreen.bind(this)} ref={(screen) => this.screen = screen} />
          </div>
          <div style={{ width: '50%', height: "100%" }}>
            <div style={{ width: '100%', height: "10%" }}>
              <Input style={{ width: '20%', height: "100%" }} placeholder="App" defaultValue={this.state.app} onChange={this.handleChangeApp.bind(this)} />
              <Input style={{ width: '20%', height: "100%" }} placeholder="Activity" defaultValue={this.state.activity} onChange={this.handleChangeActivity.bind(this)} />
              <Input style={{ width: '20%', height: "100%" }} placeholder="Package" defaultValue={this.state.package} onChange={this.handleChangePackage.bind(this)} />
              <Button style={{ width: '15%', height: "100%", float: 'right' }} onClick={this.handleRunScript.bind(this)}>Run Script</Button>
              <Button style={{ width: '15%', height: "100%", float: 'right' }} onClick={this.handleCreateSession.bind(this)}>Create Session</Button>
            </div>
            <TextArea style={{ width: '100%', height: "90%" }} defaultValue={this.state.script} onChange={this.handleChangeScript.bind(this)} />
          </div>
        </div >
        <div style={{ width: '100%', height: "500px", backgroundColor: 'gray', display: 'flex' }}>
          <div style={{ width: '50%', height: "100%", backgroundColor: 'yellow' }}>elements</div>
          <div style={{ width: '50%', height: "100%", backgroundColor: 'green' }}>log</div>
        </div >
      </div>
    );
  }

  handleMouseDownScreen(e) {
    console.log('MouseDown:', e.pageX, e.pageY);
  }

  handleChangeTouchEventAsSwipe(e) {
    this.setState({
      touch: 'swipe'
    })
  }

  handleChangeTouchEventAsTap(e) {
    this.setState({
      touch: 'tap'
    })
  }

  handleChangeTouchEventAsSelect(e) {
    this.setState({
      touch: 'select'
    })
  }

  handleRefreshScreen(e) {
    console.log('refresh screen');
  }

  handleCreateSession(e) {
    console.log('CreateSession:', this.state.app, this.state.activity, this.state.package);
  }

  handleRunScript(e) {
    console.log('run script:', this.state.script);
  }

  handleChangeApp(e) {
    this.setState({
      app: e.target.value
    })
  }

  handleChangeActivity(e) {
    this.setState({
      activity: e.target.value
    })
  }

  handleChangePackage(e) {
    this.setState({
      package: e.target.value
    })
  }

  handleChangeScript(e) {
    this.setState({
      script: e.target.value
    })
  }

}

export default App;
