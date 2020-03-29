import React, { Component } from 'react';
import { Button, Radio, message } from 'antd';
import 'antd/dist/antd.css';
import zd_image_screen from '../../public/zd_screen.png';
import {
    takeAppScreenshot,
    windowSize
} from '../http/api';

class Screen extends Component {

    constructor(props) {
        super(props);
        this.screen = null;
        this.window_size = {};
        this.screen_size = {};
        this.state = {
            screenImage: '',
            touchEvent: 'tap'
        };
        console.log('Screen received sessionId =', this.props.sessionId);
    }

    componentDidMount() {
        this.handleScreenSize();
        this.handleWindowSize();
        this.handleTakeAppScreenshot();
    }

    render() {
        return (
            <div>
                <div style={{ width: '100%', height: "40px", background: 'lightgray' }}>
                    <Radio.Group style={{ margin: '5px' }} value={this.state.touchEvent} onChange={this.handleChangeTouchEvent.bind(this)}>
                        <Radio.Button value="tap">Tap By Coordinates</Radio.Button>
                        <Radio.Button value="swipe">Swipe By Coordinates</Radio.Button>
                    </Radio.Group>
                    <Button style={{ width: '20%', height: '30px', margin: '5px', float: 'right' }} onClick={this.handleTakeAppScreenshot.bind(this)}>
                        Screenshot
                    </Button>
                    <Button style={{ width: '20%', height: '30px', margin: '5px', float: 'right' }} onClick={this.handleWindowSize.bind(this)}>
                        Window Size
                    </Button>
                </div>
                <div style={{ width: '100%', height: '500px', background: 'gray' }} ref={(screen) => this.screen = screen}>
                    <img
                        style={
                            this.state.screenImage && Object.keys(this.window_size).length != 0 && Object.keys(this.screen_size).length != 0 ?
                                { width: `${this.window_size.width * this.handleScaleRatio() }px`, height: `${this.window_size.height * this.handleScaleRatio()}px` } :
                                { width: '100%', height: '100%' }
                        }
                        src={this.state.screenImage ? `data:image/gif;base64,${this.state.screenImage}` : zd_image_screen}
                        onMouseDown={this.handleMouseDownScreen.bind(this)}
                    />
                </div>
            </div>
        )
    }

    handleScreenSize() {
        this.screen.focus();
        const top = this.screen.getBoundingClientRect().top;
        const bottom = this.screen.getBoundingClientRect().bottom;
        const left = this.screen.getBoundingClientRect().left;
        const right = this.screen.getBoundingClientRect().right;
        const x = left + document.documentElement.scrollLeft;
        const y = top + document.documentElement.scrollTop;
        const w = right - left;
        const h = bottom - top;
        this.screen_size = { x, y, w, h }
        console.log('screen xywh ->', x, y, w, h);
    }

    handleWindowSize() {
        if (this.props.sessionId) {
            windowSize(this.props.sessionId).then(res => {
                const result = res.data;
                const size = result.data;
                console.log(size);// {height: 2560, width: 1600}
                this.window_size = size;
            }).catch(error => {
                message.error('get window size error:' + error.message);
            });
        } else {
            message.error('session id is null.');
        }
    }

    handleScaleRatio() {
        let scaleRatio = 1.00;
        if (Object.keys(this.window_size).length != 0 && Object.keys(this.screen_size).length != 0) {
            const screen_w = this.screen_size.w; //950
            const window_w = this.window_size.width; // 1600

            const screen_h = this.screen_size.h; //500
            const window_h = this.window_size.height; // 2560

            const scale_w = screen_h / window_h; //0.56
            const scale_h = screen_w / window_w; //0.19

            scaleRatio = scale_w < scale_h ? scale_w : scale_h;
            console.log('scale ratio: ', scale_w, scale_h, scaleRatio);
        }
        return scaleRatio;
    }

    handleMouseDownScreen(e) {
        console.log('MouseDown:', e.pageX, e.pageY);
    }

    handleChangeTouchEvent(e) {
        this.setState({
            touchEvent: e.target.value
        })
    }

    handleTakeAppScreenshot() {
        if (this.props.sessionId) {
            takeAppScreenshot(this.props.sessionId).then(res => {
                const result = res.data;
                const screenshot = result.data;
                console.log(typeof screenshot);
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