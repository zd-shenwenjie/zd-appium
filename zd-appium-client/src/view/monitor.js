import React, { Component } from 'react';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import AnsiConverter from 'ansi-to-html';
import { addAppiumLogListener } from '../http/api';

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
                <div style={{ width: '100%', height: "800px", background: 'black', overflow: 'auto' }}>
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
                <Button type="link" style={{ float: 'right' }} onClick={this.handleClearLog.bind(this)} >Clear Log </Button>
            </div>
        )
    }

    handleClearLog() {
        this.setState({
            logs: []
        })
    }
}

export default Monitor;