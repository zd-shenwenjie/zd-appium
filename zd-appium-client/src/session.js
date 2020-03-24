import React, { Component } from 'react';
import { Button, Input, Radio, Select, message } from 'antd';
import 'antd/dist/antd.css';
import Monitor from './view/monitor';
import {
    startAppiumServer,
    stopAppiumServer,
    isAppiumServerStarted,
    getAppiumLog,
    getDevices,
    getPlatform,
    getModel,
    getPackages,
    getActivity,
    createSession,
    killSession
} from './http/api';

const { Option } = Select;

class Session extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessionId: '',
            status: 'stop',
            activity: '',
            model: '',
            platform: '',
            package: '',
            packages: []
        }
    }

    componentDidMount() {
        this.handleGetAppiumServerStatus();
        this.handleGetAndroidDevices();
        this.handleGetAndroidModel();
        this.handleGetAndroidPlatform();
        this.handleGetAndroidPackages();
    }

    render() {
        return (
            <div style={{ width: '100%' }}>
                <div style={{ width: '1320px', height: '30px', margin: '10px' }}>
                    <Radio.Group value={this.state.status} onChange={this.handleChangeAppiumServer.bind(this)}>
                        <Radio.Button style={{ width: '155px' }} value="start">Start Appium</Radio.Button>
                        <Radio.Button style={{ width: '155px' }} value="stop">Stop Appium</Radio.Button>
                    </Radio.Group>
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder='Platform Version' value={this.state.platform} onChange={this.handleChangePlatform.bind(this)} />
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder='Device Name' value={this.state.model} onChange={this.handleChangeDevice.bind(this)} />
                    {/* <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder="Package" value={this.state.package} onChange={this.handleChangePackage.bind(this)} /> */}
                    <Select value={this.state.package} style={{ width: '200px', height: '30px', marginLeft: '10px' }} onChange={this.handleChangeAndroidPackage.bind(this)}>
                        {
                            this.state.packages.map((p, i) => {
                                return (
                                    <Option key={i} value={p}>{p}</Option>
                                )
                            })
                        }
                    </Select>
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder="Activity" value={this.state.activity} onChange={this.handleChangeActivity.bind(this)} />
                    <Button disabled={this.state.sessionId} style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleCreateSession.bind(this)}>Create Session</Button>
                    <Button disabled={!this.state.sessionId} style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleKillSession.bind(this)}>Kill Session</Button>
                </div>
                <div style={{ width: '1270px', height: '30px', margin: '10px' }}>
                    <Button type="link" onClick={this.handleGetAppiumServerStatus.bind(this)}>Get Appium Server Status</Button>
                    <Button type="link" onClick={this.handleGetAppiumServerLog.bind(this)}>Get Appium Server Log</Button>
                    <Button type="link" onClick={this.handleGetAndroidDevices.bind(this)}>Get Device</Button>
                    <Button type="link" onClick={this.handleGetAndroidPlatform.bind(this)}>Get Platform Version</Button>
                    <Button type="link" onClick={this.handleGetAndroidModel.bind(this)}>Get Device Model</Button>
                    <Button type="link" onClick={this.handleGetAndroidPackages.bind(this)} >Get Packages </Button>
                    <Button type="link" onClick={this.handleGetAndroidActivity.bind(this)} >Get Activity </Button>
                </div>
                <div style={{ width: '1270px', margin: '10px' }}>
                    <Monitor />
                </div>
            </div>

        )
    }

    handleGetAppiumServerLog() {
        getAppiumLog().then(res => {
            const result = res.data;
            console.log(JSON.stringify(result));
        }).catch(error => {
            message.error(error.message);
        });
    }

    handleChangeAndroidPackage(value) {
        const pkg = value;
        this.setState({
            package: pkg,
            activity: ''
        })
        getActivity(pkg).then(res => {
            const result = res.data;
            console.log(JSON.stringify(result));
            if (result.data) {
                this.setState({
                    activity: result.data
                })
            }
        }).catch(error => {
            message.error(error.message);
        });
    }

    handleGetAndroidPackages() {
        getPackages().then(res => {
            const result = res.data;
            console.log(JSON.stringify(result));
            this.setState({
                packages: result.data
            })
        }).catch(error => {
            message.error(error.message);
        });
    }

    handleGetAndroidActivity() {
        const pkg = this.state.package;
        if (pkg) {
            getActivity(pkg).then(res => {
                const result = res.data;
                console.log(JSON.stringify(result));
                if (result.data) {
                    this.setState({
                        activity: result.data
                    })
                }
            }).catch(error => {
                message.error(error.message);
            });
        } else {
            message.warn('please select pkg .');
        }
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
                model
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

    handleCreateSession() {
        const model = this.state.model;
        const platform = this.state.platform;
        const pkg = this.state.package;
        const activity = this.state.activity;
        if (model && platform && pkg && activity) {
            createSession(model, platform, pkg, activity).then(res => {
                const result = res.data;
                console.log(JSON.stringify(result));
                const id = result.data;
                this.setState({
                    sessionId: id
                });
                if (id) {
                    window.open('http://localhost:8000/#/main', '_blank').focus();
                    window.localStorage.setItem('sessionId', id);
                }
            }).catch(error => {
                message.error(error.message);
            })
        } else {
            message.error(`mode:${model}, platform:${platform}, package:${pkg}, activity:${activity}`);
        }

        // this.props.history.push({
        //     pathname: '/main',
        //     state: {
        //         activity: this.state.activity,
        //         device: this.state.device,
        //         platform: this.state.platform,
        //         package: this.state.package
        //     }
        // });
    }

    handleKillSession() {
        const id = this.state.sessionId;
        killSession(id).then(res => {
            const result = res.data;
            message.success(JSON.stringify(result));
            this.setState({
                sessionId: ''
            })
        }).catch(error => {
            message.error(error.message);
        })
    }

    handleChangePlatform(e) {
        this.setState({
            platform: e.target.value
        })
    }

    handleChangeDevice(e) {
        this.setState({
            model: e.target.value
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