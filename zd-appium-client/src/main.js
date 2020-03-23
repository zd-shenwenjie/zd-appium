import React, { Component } from 'react';
import Screen from './view/screen';
import Editor from './view/editor';
import Elements from './view/elements';

class Main extends Component {

    constructor(props) {
        super(props);
        // console.log( this.props.location.state);
        console.log(window.localStorage.getItem('package'))
    }

    componentDidMount() {
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
