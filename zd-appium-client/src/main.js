import React, { Component } from 'react';
import { message } from 'antd';
import 'antd/dist/antd.css';
import Screen from './view/screen';
import Editor from './view/editor';
import Elements from './view/elements';
import {
    connection,
    runKeepAlive,
    killKeepAlive,
    addSessionListener
} from './http/api';

class Main extends Component {

    constructor(props) {
        super(props);
        this.sessionId = window.localStorage.getItem('sessionId');
        console.log('Main received sessionId =', this.sessionId)
    }

    componentDidMount() {
        if (this.sessionId) {
            addSessionListener(function (status) {
                if (status == 'invalid' || status == 'kill') {
                    killKeepAlive();
                    console.log(`appium Session is ${status}.`)
                    message.warn(`appium Session is ${status}.`)
                }
            });
            connection();
            runKeepAlive(this.sessionId);
        }
    }

    render() {
        return (
            <div >
                <div style={{ width: '1900px', display: 'flex' }}>
                    <div style={{ width: '50%' }}>
                        <Screen sessionId={this.sessionId} />
                        <Elements sessionId={this.sessionId} />
                    </div>
                    <div style={{ width: '50%' }}>
                        <Editor />
                    </div>
                </div >
            </div>
        );
    }


}

export default Main;
