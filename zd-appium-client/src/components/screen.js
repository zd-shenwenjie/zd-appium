import React, { Component } from 'react';
import { Button, Radio } from 'antd';
import 'antd/dist/antd.css';
import image_screen from '../../public/zd_screen.png';

class Screen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            screenImage: image_screen,
            touchEvent: 'tap'
        };
    }

    componentDidMount() {
        // this.screen.focus();
        // const top = this.screen.getBoundingClientRect().top;
        // const bottom = this.screen.getBoundingClientRect().bottom;
        // const left = this.screen.getBoundingClientRect().left;
        // const right = this.screen.getBoundingClientRect().right;
        // const x = left + document.documentElement.scrollLeft;
        // const y = top + document.documentElement.scrollTop;
        // const w = right - left;
        // const h = bottom - top;
        // console.log(x, y, w, h);
    }

    render() {
        return (
            <div style={{ width: '50%' }}>
                <div style={{ width: '100%', height: "40px", background: 'lightgray' }}>
                    <Radio.Group style={{ margin: '5px' }} value={this.state.touchEvent} onChange={this.handleChangeTouchEvent.bind(this)}>
                        <Radio.Button value="tap">Tap By Coordinates</Radio.Button>
                        <Radio.Button value="swipe">Swipe By Coordinates</Radio.Button>
                    </Radio.Group>
                    <Button style={{ width: '20%', height: '30px', margin: '5px', float: 'right' }} >
                        Screenshot
                    </Button>
                </div>


                <div style={{
                    width: '100%', 
                    height: '500px'
                }}>
                    <img
                        style={{ width: '100%', height: '100%' }}
                        src={this.state.screenImage}
                        onMouseDown={this.handleMouseDownScreen.bind(this)}
                        ref={(screen) => this.screen = screen}
                    />
                </div>
            </div>
        )
    }

    handleMouseDownScreen(e) {
        console.log('MouseDown:', e.pageX, e.pageY);
    }

    handleChangeTouchEvent(e) {
        this.setState({
            touchEvent: e.target.value
        })
    }

    handleRefreshScreen(e) {
        console.log('refresh screen');
        message.success('refresh screen');
    }
}

export default Screen;