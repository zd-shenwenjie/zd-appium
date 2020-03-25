import React, { Component } from 'react';
import { message } from 'antd';
import 'antd/dist/antd.css';
import Screen from './view/screen';
import Editor from './view/editor';
import Elements from './view/elements';
import {
    keepAlive,
    killKeepAlive,
    addSessionListener
} from './http/api';

class Main extends Component {

    constructor(props) {
        super(props);
        // console.log( this.props.location.state);
    }

    componentDidMount() {
        this.sessionId = window.localStorage.getItem('sessionId');
        if (this.sessionId) {
            keepAlive(this.sessionId);
            addSessionListener(function (status) {
                if (status == 'invalid') {
                    killKeepAlive();
                    console.log('Appium Session Invalid.')
                    message.warn('Appium Session Invalid.')
                } else if (status == 'kill') {
                    killKeepAlive();
                    console.log('Appium Session killed.')
                    message.warn('Appium Session killed.')
                }
            });
        }
    }

    render() {
        return (
            <div >
                <div style={{ width: '1900px', display: 'flex' }}>
                    <div style={{ width: '50%' }}>
                        <Screen />
                        <Elements />
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
