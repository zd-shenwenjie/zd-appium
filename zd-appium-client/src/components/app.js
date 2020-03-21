import React, { Component } from 'react';
import { Button, Input, Tree, message } from 'antd';
import 'antd/dist/antd.css';


import Screen from './screen';
import Editor from './editor';
import Elements from './elements';
import Monitor from './monitor';

import SocketClient from 'socket.io-client';
import axios from 'axios';



// const URL_SERVER_BASE = 'http://localhost:7000/api/appium';
const URL_SERVER_BASE = 'http://localhost:7001';
const URL_START_APPIUM = URL_SERVER_BASE + '/connectStartServer';
const URL_STOP_APPIUM = URL_SERVER_BASE + '/connectStopServer';

class App extends Component {

    constructor(props) {
        super(props);
        this.client = null;

        this.state = {
            touch: 'select',
            app: '',
            activity: '',
            package: '',
            script: '',
            logLines: [],
            // elements = {}
        }
    }

    componentDidMount() {
        // this.initScreen();
        // this.initSocket();
        // this.initElements();
    }

    render() {
        return (
            <div >
                {/* <div style={{ width: '100%', height: "30px", display: 'flex' }}>
                    <Button style={{ width: '10%', height: "100%" }} onClick={this.handleStartAppium.bind(this)}>Start Appium</Button>
                    <Button style={{ width: '10%', height: "100%" }} onClick={this.handleStopAppium.bind(this)}>Stop Appium</Button>
                    <div style={{ width: '80%', height: "100%", display: 'flex', marginLeft: '10px' }}>
                        <Input style={{ width: '10%' }} placeholder="App" defaultValue={this.state.app} onChange={this.handleChangeApp.bind(this)} />
                        <Input style={{ width: '10%' }} placeholder="Activity" defaultValue={this.state.activity} onChange={this.handleChangeActivity.bind(this)} />
                        <Input style={{ width: '10%' }} placeholder="Package" defaultValue={this.state.package} onChange={this.handleChangePackage.bind(this)} />
                        <Button style={{ width: '10%', height: "100%" }} onClick={this.handleCreateSession.bind(this)}>Create Session</Button>
                    </div>
                </div> */}

                <div style={{ width: '100%', display: 'flex' }}>
                    <Screen />
                    <Editor />
                </div >
                <div style={{ width: '100%', display: 'flex' }}>
                    <Elements/>
                    <Monitor/>
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

}

export default App;
