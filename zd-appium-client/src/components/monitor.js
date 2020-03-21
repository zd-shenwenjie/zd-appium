import React, { Component } from 'react';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import AnsiConverter from 'ansi-to-html';

const convert = new AnsiConverter({ fg: '#bbb', bg: '#222' });

class Monitor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: []
        }
    }

    render() {
        return (
            <div style={{ width: '50%' }}>

                <div style={{ width: '100%', height: "40px", background: 'lightgray' }}>
                    <Button style={{ width: '20%', height: '30px', margin: '5px', float: 'right' }} >
                        Log File
                    </Button>
                </div >

                <div style={{ width: '100%', height: "500px", background: 'black' }}>
                    {
                        this.state.logs.map((log, index) => {
                            return (
                                <div key={index}>
                                    <span dangerouslySetInnerHTML={{ __html: convert.toHtml(log.msg) }} />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default Monitor;