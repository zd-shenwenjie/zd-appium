import React, { Component } from 'react';
import { Button, Radio, message } from 'antd';
import 'antd/dist/antd.css';
import zd_image_screen from '../../public/zd_screen.png';
import {
    takeAppScreenshot,
    windowSize,
    tap,
    swipe
} from '../http/api';

class Screen extends Component {

    constructor(props) {
        super(props);
        this.screenDiv = null;
        this.sessionId = '';
        this.window_size = {}; // app window size
        this.screen_size = {}; // screen size
        this.screen_max_size = {}; // screen div size
        this.scale_ratio = 0;
        this.swipeXY = {};// {from:{x,y},to:{x,y}

        this.state = {
            screenImage: '',
            touchEvent: 'tap'
        };
        console.log('Screen received sessionId =', this.props.sessionId);
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    render() {
        return (
            <div>
                <div style={{ width: '800px', height: "40px", background: 'lightgray' }}>
                    <Radio.Group value={this.state.touchEvent} onChange={this.handleChangeTouchEvent.bind(this)}>
                        <Radio.Button style={{ width: '155px', marginTop: '5px', marginLeft: '5px' }} value="tap">Tap </Radio.Button>
                        <Radio.Button style={{ width: '155px', marginTop: '5px' }} value="swipe">Swipe </Radio.Button>
                    </Radio.Group>
                    <Button style={{ width: '150px', height: '30px', marginRight: '10px', marginTop: '5px', float: 'right' }} onClick={this.handleTakeAppScreenshot.bind(this)}>
                        Screenshot
                    </Button>
                    <Button style={{ width: '150px', height: '30px', marginRight: '10px', marginTop: '5px', float: 'right' }} onClick={this.handleWindowSize.bind(this)}>
                        Window Size
                    </Button>
                </div>
                <div style={{ width: '800px', height: '500px', background: 'gray', justifyContent: 'center', textAlign: 'center' }} ref={(screenDiv) => this.screenDiv = screenDiv}>
                    <img
                        style={{ ...this.handleScreenSize() }}
                        src={this.state.screenImage ? `data:image/gif;base64,${this.state.screenImage}` : zd_image_screen}
                        onMouseDown={this.handleMouseDownScreen.bind(this)}
                    />
                </div>
            </div>
        )
    }

    handleUpdateView(sessionId) {
        this.sessionId = sessionId;
        this.handleScreenMaxSize();
        this.handleWindowSize();
        this.handleTakeAppScreenshot();
    }

    handleScaleRatio() {
        let scale_ratio = 0;
        if (this.window_size &&
            this.window_size.hasOwnProperty('width') &&
            this.window_size.hasOwnProperty('height') &&
            this.screen_max_size &&
            this.screen_max_size.hasOwnProperty('w') &&
            this.screen_max_size.hasOwnProperty('h')) {
            const screen_max_w = this.screen_max_size.w; //950
            const screen_max_h = this.screen_max_size.h; //500
            const window_w = this.window_size.width; // 1600
            const window_h = this.window_size.height; // 2560
            const scale_w = screen_max_h / window_h; //0.56
            const scale_h = screen_max_w / window_w; //0.19
            scale_ratio = scale_w < scale_h ? scale_w : scale_h;
            this.scale_ratio = scale_ratio;
            console.log('scale_ratio: ', this.scale_ratio);
        }
        return scale_ratio;
    }

    handleScreenSize() {
        let screen_size = { width: '100%', height: '100%' };
        if (this.state.screenImage &&
            this.window_size &&
            this.window_size.hasOwnProperty('width') &&
            this.window_size.hasOwnProperty('height') &&
            this.screen_max_size &&
            this.screen_max_size.hasOwnProperty('w') &&
            this.screen_max_size.hasOwnProperty('h')) {
            const scale_ratio = this.handleScaleRatio();
            if (scale_ratio != 0) {
                const w = this.window_size.width * scale_ratio;
                const h = this.window_size.height * scale_ratio;
                const x = (this.screen_max_size.w - w) / 2;
                const y = (this.screen_max_size.h - h) / 2;
                screen_size = { width: `${w}px`, height: `${h}px` };
                this.screen_size = { x, y, w, h };
                console.log('screen_size:' + x, y, w, h);
            }
        }
        return screen_size;
    }

    handleScreenMaxSize() {
        this.screenDiv.focus();
        const top = this.screenDiv.getBoundingClientRect().top;
        const bottom = this.screenDiv.getBoundingClientRect().bottom;
        const left = this.screenDiv.getBoundingClientRect().left;
        const right = this.screenDiv.getBoundingClientRect().right;
        const x = left + document.documentElement.scrollLeft;
        const y = top + document.documentElement.scrollTop;
        const w = right - left;
        const h = bottom - top;
        this.screen_max_size = { x, y, w, h }
        console.log('screen_max_size:', x, y, w, h);
    }

    handleWindowSize() {
        if (this.sessionId) {
            windowSize(this.sessionId).then(res => {
                const result = res.data;
                const size = result.data;
                this.window_size = size;
                console.log('window_size:', JSON.stringify(size));// {height: 2560, width: 1600}
            }).catch(error => {
                message.error('get window size error:' + error.message);
            });
        } else {
            message.error('session id is null.');
        }
    }

    handleMouseDownScreen(e) {
        if (this.screen_size &&
            this.screen_size.hasOwnProperty('x') &&
            this.screen_size.hasOwnProperty('y') &&
            this.screen_size.hasOwnProperty('w') &&
            this.screen_size.hasOwnProperty('h') &&
            this.screen_max_size &&
            this.screen_max_size.hasOwnProperty('x') &&
            this.screen_max_size.hasOwnProperty('y') &&
            this.screen_max_size.hasOwnProperty('w') &&
            this.screen_max_size.hasOwnProperty('h') &&
            this.scale_ratio != 0
        ) {
            const x = (e.pageX - this.screen_max_size.x - this.screen_size.x) / this.scale_ratio;
            const y = (e.pageY - this.screen_max_size.y - this.screen_size.y) / this.scale_ratio;
            // console.log('x:', x, 'y:', y);
            if (this.state.touchEvent == 'swipe') {
                if (this.swipeXY.hasOwnProperty('from') && this.swipeXY.hasOwnProperty('to')) {
                    this.swipeXY = {};
                    //console.log('clean swipe object.')
                }
                if (!this.swipeXY.hasOwnProperty('from') && !this.swipeXY.hasOwnProperty('to')) {
                    this.swipeXY['from'] = { x, y };
                    //console.log(JSON.stringify(this.swipeXY));
                } else if (this.swipeXY.hasOwnProperty('from') && !this.swipeXY.hasOwnProperty('to')) {
                    const from = this.swipeXY.from;
                    const to = { x, y };
                    this.swipeXY = { from, to };
                    this.handleSwipeEvent(from, to);
                }
            } else if (this.state.touchEvent == 'tap') {
                this.handleTapEvent(x, y);
            }
        }
    }

    handleTapEvent(x, y) {
        if (x && y) {
            tap(this.sessionId, x, y).then(res => {
                const result = res.data;
                console.log(JSON.stringify(result));
            }).catch(error => {
                message.error('tap error:' + error.message);
            });
        } else {
            message.error('tap coordinates is null.');
        }
        console.log(x, y);
    }

    handleSwipeEvent(from, to) {
        if (from && from.hasOwnProperty('x') && from.hasOwnProperty('y') && to && to.hasOwnProperty('x') && to.hasOwnProperty('y')) {
            swipe(this.sessionId, from, to).then(res => {
                const result = res.data;
                console.log(JSON.stringify(result));
            }).catch(error => {
                message.error('swipe error:' + error.message);
            });
        } else {
            message.error('swipe coordinates is null.');
        }
        console.log(from, to);
    }

    handleChangeTouchEvent(e) {
        this.setState({
            touchEvent: e.target.value
        })
    }

    handleTakeAppScreenshot() {
        if (this.sessionId) {
            takeAppScreenshot(this.sessionId).then(res => {
                const result = res.data;
                const screenshot = result.data;
                // console.log(typeof screenshot);
                if (screenshot) {
                    this.setState({
                        screenImage: screenshot
                    })
                }
            }).catch(error => {
                message.error('take app screenshot error:' + error.message);
            });
        } else {
            message.error('session id is null.');
        }
    }
}

export default Screen;