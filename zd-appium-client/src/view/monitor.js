import React, { Component } from 'react';
import { Button, message } from 'antd';
import 'antd/dist/antd.css';
import AnsiConverter from 'ansi-to-html';
import { addAppiumLogListener } from '../http/api';
import {
    getAppiumLog
} from '../http/api';
const convert = new AnsiConverter({ fg: '#bbb', bg: '#222' });
const MAX_LOG_LINE = 300;

class Monitor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: []
        }
    }

    componentDidMount() {
        addAppiumLogListener((batchedLogs) => {
            const logs = batchedLogs.map(log => { return log.msg })
            const curLogLines = [...this.state.logs, ...logs];
            const length = curLogLines.length;
            if (length > MAX_LOG_LINE) {
                curLogLines.splice(0, length - MAX_LOG_LINE);
            }
            this.setState({
                logs: curLogLines
            })

        })
    }

    render() {
        return (
            <div >
                <div style={{ width: '490px', height: "40px", background: 'lightgray' }}>
                    <Button style={{ width: '150px', height: '30px', margin: '5px', float: 'right' }} onClick={this.handleClearLog.bind(this)} >Clear Log </Button>
                    <Button style={{ width: '150px', height: '30px', margin: '5px', float: 'right' }} onClick={this.handleGetAppiumServerLog.bind(this)}>Server Log</Button>
                </div >

                <div style={{ width: '490px', height: "1040px", background: 'black', overflow: 'auto' }}>
                    {
                        this.state.logs.map((log, index) => {
                            return (
                                <div key={index}>
                                    <span dangerouslySetInnerHTML={{ __html: convert.toHtml(log) }} />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }

    handleClearLog() {
        this.setState({
            logs: []
        })
    }

    handleGetAppiumServerLog() {
        getAppiumLog().then(res => {
            const result = res.data;
            console.log(JSON.stringify(result));
        }).catch(error => {
            message.error(error.message);
        });
    }
}

export default Monitor;