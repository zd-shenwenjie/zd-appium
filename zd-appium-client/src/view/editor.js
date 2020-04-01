import React, { Component } from 'react';
import { Button, message } from 'antd';
import 'antd/dist/antd.css';
import MonacoEditor from 'react-monaco-editor';
import { runScript } from '../http/api';


class Editor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            script: ''
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <div >
                <div style={{ width: '600px', height: '40px', background: 'lightgray' }}>
                    <Button
                        style={{ width: '150px', height: '30px', margin: '5px', float: 'right' }}
                        onClick={this.handleRunScript.bind(this)}>
                        Run Script
                    </Button>
                </div>
                <div style={{ width: '600px', height: '500px' }} >
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
        )
    }

    handleRunScript(e) {
        const script = this.state.script;
        const userId = this.props.handleGetUserId();
        if (userId && script) {
            runScript(userId, script).then(res => {
                const result = res.data;
                console.log(JSON.stringify(result));
            }).catch(error => {
                message.error(error.message);
            });
        } else {
            message.error(`script = ${script} or uid = ${userId} is null.`);
        }
    }

    handleChangeScript(value, e) {
        this.setState({
            script: value
        })
    }
}

export default Editor;