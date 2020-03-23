import React, { Component } from 'react';
import { Button, Input, Radio, message } from 'antd';
import 'antd/dist/antd.css';
import Monitor from './view/monitor';
import {
    startAppiumServer,
    stopAppiumServer,
    isAppiumServerStarted,
    getDevices,
    getPlatform,
    getModel
} from './http/api';

// const { Option } = Select;

class Session extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'stop',
            activity: '',
            device: '',
            platform: '',
            package: ''
        }
    }

    componentDidMount() {
        this.handleGetAppiumServerStatus();
        this.handleGetAndroidDevices();
        this.handleGetAndroidModel();
        this.handleGetAndroidPlatform();
    }

    render() {
        return (
            <div style={{ width: '100%' }}>
                <div style={{ width: '1270px', height: '30px', margin: '10px' }}>
                    <Radio.Group value={this.state.status} onChange={this.handleChangeAppiumServer.bind(this)}>
                        <Radio.Button style={{ width: '155px' }} value="start">Start Appium</Radio.Button>
                        <Radio.Button style={{ width: '155px' }} value="stop">Stop Appium</Radio.Button>
                    </Radio.Group>
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder='Platform Version' value={this.state.platform} onChange={this.handleChangePlatform.bind(this)} />
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder='Device Name' value={this.state.device} onChange={this.handleChangeDevice.bind(this)} />
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder="Activity" value={this.state.activity} onChange={this.handleChangeActivity.bind(this)} />
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder="Package" value={this.state.package} onChange={this.handleChangePackage.bind(this)} />
                    <Button style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleCreateSession.bind(this)}>Create Session</Button>
                    <Button style={{ width: '150px', height: '30px', marginLeft: '10px' }} >Kill Session</Button>
                </div>
                <div style={{ width: '1270px', height: '30px', margin: '10px' }}>
                    <Button type="link" onClick={this.handleGetAppiumServerStatus.bind(this)}>Get Appium Server Status</Button>
                    <Button type="link">Get Appium Server Log</Button>
                    <Button type="link" onClick={this.handleGetAndroidDevices.bind(this)}>Get Device</Button>
                    <Button type="link" onClick={this.handleGetAndroidPlatform.bind(this)}>Get Platform Version</Button>
                    <Button type="link" onClick={this.handleGetAndroidModel.bind(this)}>Get Device Name</Button>
                    <Button type="link">Get Package and Activity</Button>
                </div>
                <div style={{ width: '1270px', margin: '10px' }}>
                    <Monitor />
                </div>
            </div>

        )
    }

    handleGetAppiumServerStatus() {
        isAppiumServerStarted().then(res => {
            const result = res.data;
            console.log(JSON.stringify(result));
            if (result.data) {
                this.setState({ status: 'start' });
            } else {
                this.setState({ status: 'stop' });
            }
        }).catch(error => {
            message.error(error.message);
        });
    }

    handleGetAndroidDevices() {
        getDevices().then(res => {
            const result = res.data;
            console.log(JSON.stringify(result));
        }).catch(error => {
            message.error(error.message);
        });
    }

    handleGetAndroidPlatform() {
        getPlatform().then(res => {
            const result = res.data;
            const platform = result.data;
            console.log(JSON.stringify(result));
            this.setState({
                platform
            })
        }).catch(error => {
            message.error(error.message);
        });
    }

    handleGetAndroidModel() {
        getModel().then(res => {
            const result = res.data;
            const model = result.data;
            console.log(JSON.stringify(result));
            this.setState({
                device: model
            })
        }).catch(error => {
            message.error(error.message);
        });
    }

    handleChangeAppiumServer(e) {
        const value = e.target.value;
        if (value == 'start') {
            startAppiumServer().then(res => {
                const result = res.data;
                message.success(JSON.stringify(result));
                this.setState({ status: 'start' });
            }).catch(error => {
                message.error(error.message);
            });
        } else if (value == 'stop') {
            stopAppiumServer().then(res => {
                const result = res.data;
                message.success(JSON.stringify(result));
                this.setState({ status: 'stop' });
            }).catch(error => {
                message.error(error.message);
            })
        }
    }

    handleCreateSession(e) {
        // this.props.history.push({
        //     pathname: '/main',
        //     state: {
        //         activity: this.state.activity,
        //         device: this.state.device,
        //         platform: this.state.platform,
        //         package: this.state.package
        //     }
        // });
        window.open('http://localhost:8000/#/main', '_blank').focus();
        window.localStorage.setItem('package', 'com.zdautomotive.com');
    }

    handleChangePlatform(e) {
        this.setState({
            platform: e.target.value
        })
    }

    handleChangeDevice(e) {
        this.setState({
            device: e.target.value
        })
    }

    handleChangeActivity(e) {
        this.setState({
            activity: e.target.value
        })
    }

    handleChangePackage(e) {
        this.setState({
            package: e.target.value
        })
    }
}

export default Session;