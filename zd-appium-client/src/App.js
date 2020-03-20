import React, { Component } from 'react';
import { Button, Input, message } from 'antd';
import 'antd/dist/antd.css';
import MonacoEditor from 'react-monaco-editor';
import AnsiConverter from 'ansi-to-html';
import image_screen from '../public/screen.png';
import SocketClient from 'socket.io-client';
import axios from 'axios';
const convert = new AnsiConverter({ fg: '#bbb', bg: '#222' });
// const URL_SERVER_BASE = 'http://localhost:7000/api/appium';
const URL_SERVER_BASE = 'http://localhost:7001';
const URL_START_APPIUM = URL_SERVER_BASE + '/connectStartServer';
const URL_STOP_APPIUM = URL_SERVER_BASE + '/connectStopServer';

class App extends Component {

    constructor(props) {
        super(props);
        this.client = null;
        this.screen = {
            x: -1,
            y: -1,
            w: -1,
            h: -1
        };
        this.state = {
            touch: 'select',
            app: '',
            activity: '',
            package: '',
            script: '',
            logLines: []
        }
    }

    componentDidMount() {
        this.initScreen();
        this.initSocket();
    }

    render() {
        return (
            <div>
                <div style={{ width: '100%', height: "30px", display: 'flex' }}>
                    <Button style={{ width: '10%', height: "100%" }} onClick={this.handleStartAppium.bind(this)}>Start Appium</Button>
                    <Button style={{ width: '10%', height: "100%" }} onClick={this.handleStopAppium.bind(this)}>Stop Appium</Button>
                    <div style={{ width: '80%', height: "100%", display: 'flex', marginLeft: '10px' }}>
                        <Input style={{ width: '10%' }} placeholder="App" defaultValue={this.state.app} onChange={this.handleChangeApp.bind(this)} />
                        <Input style={{ width: '10%' }} placeholder="Activity" defaultValue={this.state.activity} onChange={this.handleChangeActivity.bind(this)} />
                        <Input style={{ width: '10%' }} placeholder="Package" defaultValue={this.state.package} onChange={this.handleChangePackage.bind(this)} />
                        <Button style={{ width: '10%', height: "100%" }} onClick={this.handleCreateSession.bind(this)}>Create Session</Button>
                    </div>
                </div>

                <div style={{ width: '100%', height: '600px', display: 'flex', marginTop: '10px' }}>
                    <div style={{ width: '50%', height: '100%', background: 'gray' }}>
                        <div style={{ width: '100%', height: "5%" }}>
                            <Button style={{ width: '20%', height: "100%" }} onClick={this.handleChangeTouchEventAsSwipe.bind(this)} > Swipe By Coordinates</Button>
                            <Button style={{ width: '20%', height: "100%" }} onClick={this.handleChangeTouchEventAsTap.bind(this)} > Tap By Coordinates</Button>
                            <Button style={{ width: '20%', height: "100%" }} onClick={this.handleChangeTouchEventAsSelect.bind(this)} > Select Elements</Button>
                            <Button style={{ width: '20%', height: "100%" }} onClick={this.handleRefreshScreen.bind(this)}>Refresh</Button>
                        </div>
                        <img src={image_screen} style={{ width: '100%', height: '95%' }} onMouseDown={this.handleMouseDownScreen.bind(this)} ref={(screen) => this.screen = screen} />
                    </div>
                    <div style={{ width: '50%', height: "100%", background: 'red' }}>
                        <div style={{ width: '100%', height: '5%' }}>
                            <Button style={{ width: '20%', height: '100%', float: 'right' }} onClick={this.handleRunScript.bind(this)}>Run Script</Button>
                        </div>
                        <div style={{ width: '100%', height: '95%', background: 'blue' }} >
                            <MonacoEditor
                                style={{ width: '100%', height: '100%' }}
                                language="javascript"
                                theme="vs-dark"
                                defaultValue={this.state.script}
                                options={{
                                    selectOnLineNumbers: true,
                                    roundedSelection: false,
                                    readOnly: false,
                                    cursorStyle: "line",
                                    automaticLayout: false
                                }}
                                onChange={this.handleChangeScript.bind(this)}
                            />
                        </div>
                    </div>
                </div >
                <div style={{ width: '100%', height: "600px", display: 'flex' }}>
                    <div style={{ width: '50%', height: "100%" }}>
                        elements
                    </div>
                    <div style={{ width: '50%', height: "100%", background: 'black' }}>
                        {
                            this.state.logLines.map((log, index) => {
                                return (
                                    <div key={index}>
                                        <span dangerouslySetInnerHTML={{ __html: convert.toHtml(log.msg) }} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div >
            </div>
        );
    }

    initScreen() {
        this.screen.focus();
        const top = this.screen.getBoundingClientRect().top;
        const bottom = this.screen.getBoundingClientRect().bottom;
        const left = this.screen.getBoundingClientRect().left;
        const right = this.screen.getBoundingClientRect().right;
        const x = left + document.documentElement.scrollLeft;
        const y = top + document.documentElement.scrollTop;
        const w = right - left;
        const h = bottom - top;
        this.screen = { x, y, w, h };
        console.log(x, y, w, h);
    }

    initSocket() {
        this.client = new SocketClient(URL_SERVER_BASE);
        this.client.on('appium-log-line', (batchedLogs) => {
            const curLogLines = [...this.state.logLines, ...batchedLogs];
            const length = curLogLines.length;
            if (length > 100) {
                curLogLines.splice(0, length - 100);
            }
            console.log(JSON.stringify(curLogLines));
            this.setState({
                logLines: curLogLines
            })
        })
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
        message.success('refresh screen');
    }

    handleStartAppium(e) {
        axios.post(URL_START_APPIUM).then(res => {
            const result = res.data;
            message.success(JSON.stringify(result));
        }).catch(error => {
            message.error(error.message);
        })
    }

    handleStopAppium(e) {
        axios.post(URL_STOP_APPIUM).then(res => {
            const result = res.data;
            message.success(JSON.stringify(result));
        }).catch(error => {
            message.error(error.message);
        })
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

    handleChangeScript(value, e) {
        this.setState({
            script: value
        })
    }

}

export default App;
