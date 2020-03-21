import React, { Component } from 'react';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import MonacoEditor from 'react-monaco-editor';

class Editor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            script: ''
        }
    }

    render() {
        return (
            <div style={{ width: '50%'}}>
                <div style={{ width: '100%', height: '40px', background: 'lightgray' }}>
                    <Button
                        style={{ width: '20%', height: '30px', margin:'5px', float: 'right' }}
                        onClick={this.handleRunScript.bind(this)}>
                        Run Script
                    </Button>
                </div>
                <div style={{ width: '100%', height: '500px' }} >
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
        console.log('run script:', this.state.script);
    }

    handleChangeScript(value, e) {
        this.setState({
            script: value
        })
    }
}

export default Editor;