import React, { Component } from 'react';
import { Button, Input, Radio, Select, message } from 'antd';
import 'antd/dist/antd.css';
import Monitor from './view/monitor';
import Screen from './view/screen';
import Elements from './view/elements';
import Editor from './view/editor';
import {
    connection,
    startAppiumServer,
    stopAppiumServer,
    appiumServerStatus,
    getDevices,
    getPlatform,
    getModel,
    getPackages,
    getActivity,
    createSession,
    killSession,
    addAppiumClientListener,
    addAppiumServerLister,
    addSessionListener,
    runKeepAlive,
    killKeepAlive,
} from './http/api';

const { Option } = Select;
class App extends Component {
    constructor(props) {
        super(props);
        this.userId = '';
        this.sessionId = '';
        this.screen_view = null;
        this.elements_view = null;
        this.state = {
            isCreateSessionReady: true,
            isKillSessionReady: true,
            status: 'stop',
            activity: '',
            model: '',
            platform: '',
            package: '',
            packages: [],
            ownerIP: '',
            isRunKeepSessionLoop: false
        }
    }

    componentDidMount() {
        this.handleGetAppiumServerStatus();
        this.handleGetAndroidDevices();
        this.handleGetAndroidModel();
        this.handleGetAndroidPlatform();
        this.handleGetAndroidPackages();
        addAppiumClientListener((status, args) => {
            if (status == 'uid') {
                this.userId = args;
                console.log('socket client uid = ' + this.userId);
            } else if (status == 'error') {
                this.userId = null;
                if (this.state.isRunKeepSessionLoop) {
                    killKeepAlive();
                    this.setState({
                        isRunKeepSessionLoop: false
                    })
                }
                this.setState({
                    status: 'stop',
                    isCreateSessionReady: false,
                    isKillSessionReady: false,
                    ownerIP: ''
                });
                console.log('socket client error.');
                message.error('socket client error.');
            } else if (status == 'timeout') {
                this.userId = null;
                if (this.state.isRunKeepSessionLoop) {
                    killKeepAlive();
                    this.setState({
                        isRunKeepSessionLoop: false
                    })
                }
                this.setState({
                    status: 'stop',
                    isCreateSessionReady: false,
                    isKillSessionReady: false,
                    ownerIP: ''
                });
                console.log('socket client timeout.');
                message.error('socket client timeout.');
            } else if (status == 'reconnect') {
                this.handleGetAppiumServerStatus();
                console.log('socket client reconnect.');
                message.success('socket client reconnect.');
            }
        });
        addAppiumServerLister((status) => {
            if (status == 'start') {
                this.setState({
                    status: 'start',
                    isCreateSessionReady: true,
                    isKillSessionReady: false
                });
                console.log('appium server start.')
            } else if (status == 'stop') {
                this.setState({
                    status: 'stop',
                });
                console.log('appium server stop.')
            }
        });
        addSessionListener((status, args) => {
            if (status == 'new') {
                const ownerIP = args && args.hasOwnProperty('ip') ? args.ip : 'unknown';
                this.setState({
                    isCreateSessionReady: false,
                    isKillSessionReady: true,
                    ownerIP
                })
                console.log(`${ownerIP} create session.`)
            } else if (status == 'kill') {
                const killerIP = args && args.hasOwnProperty('ip') ? args.ip : 'unknown';
                if (this.sessionId) {
                    this.sessionId = null;
                }
                if (this.state.isRunKeepSessionLoop) {
                    killKeepAlive();
                    this.setState({
                        isRunKeepSessionLoop: false
                    })
                }
                this.setState({
                    isCreateSessionReady: true,
                    isKillSessionReady: false,
                    ownerIP: ''
                })
                console.log(`${killerIP} kill the session .`)
            } else if (status == 'invalid') {
                if (this.sessionId) {
                    this.sessionId = null;
                }
                if (this.state.isRunKeepSessionLoop) {
                    killKeepAlive();
                    this.setState({
                        isRunKeepSessionLoop: false
                    })
                }
                this.setState({
                    isCreateSessionReady: true,
                    isKillSessionReady: false,
                    ownerIP: ''
                })
                console.log(`session is invalid.`)
            }
        });
        connection();
    }

    render() {
        return (
            <div style={{ width: '100%'  }}>
                <div style={{ width: '100%', height: '30px', margin: '10px' }}>
                    <Radio.Group value={this.state.status} onChange={this.handleChangeAppiumServer.bind(this)}>
                        <Radio.Button style={{ width: '155px' }} value="start">Start Appium</Radio.Button>
                        <Radio.Button style={{ width: '155px' }} value="stop">Stop Appium</Radio.Button>
                    </Radio.Group>
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder='Platform Version' value={this.state.platform} onChange={this.handleChangePlatform.bind(this)} />
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder='Device Name' value={this.state.model} onChange={this.handleChangeDevice.bind(this)} />
                    <Select value={this.state.package} style={{ width: '150px', height: '30px', marginLeft: '10px' }} onChange={this.handleChangeAndroidPackage.bind(this)}>
                        {
                            this.state.packages.map((p, i) => {
                                return (
                                    <Option key={i} value={p}>{p}</Option>
                                )
                            })
                        }
                    </Select>
                    <Input style={{ width: '150px', height: '30px', marginLeft: '10px' }} placeholder="Activity" value={this.state.activity} onChange={this.handleChangeActivity.bind(this)} />
                    <Button disabled={!this.state.isCreateSessionReady} style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleCreateSession.bind(this)}>Create Session</Button>
                    <Button disabled={!this.state.isKillSessionReady} style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleKillSession.bind(this)}>Kill Session</Button>
                    {
                        this.state.ownerIP ? <span style={{ marginLeft: '10px', color: 'blue' }} >{`${this.state.ownerIP} is Running`} </span> : null
                    }
                </div>
                <div style={{ width: '100%', height: '30px', margin: '10px'}}>
                    <Radio.Group value={this.state.isRunKeepSessionLoop ? 'keep' : 'kill'} onChange={this.handleChangeKeepSessionLoop.bind(this)}>
                        <Radio.Button style={{ width: '155px' }} value="keep"> Keep Session Alive</Radio.Button>
                        <Radio.Button style={{ width: '155px' }} value="kill">Kill Session Alive</Radio.Button>
                    </Radio.Group>
                    <Button style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleGetAppiumServerStatus.bind(this)}>Server Status</Button>
                    <Button style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleGetAndroidDevices.bind(this)}>Android Device</Button>
                    <Button style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleGetAndroidPlatform.bind(this)}>Platform Version</Button>
                    <Button style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleGetAndroidModel.bind(this)}>Device Model</Button>
                    <Button style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleGetAndroidPackages.bind(this)} >Android Packages </Button>
                    <Button style={{ width: '150px', height: '30px', marginLeft: '10px' }} onClick={this.handleGetAndroidActivity.bind(this)} >Android Activity </Button>
                </div>
                <div style={{ width: '100%', display: 'flex' }}>
                    <div>
                        <div style={{ marginTop: '10px', marginLeft: '10px', display: 'flex' }}>
                            <Screen onRef={(screen_view) => { this.screen_view = screen_view }} />
                            <Editor handleGetUserId={() => { return this.userId }} />
                        </div>
                        <div style={{ marginLeft: '10px', display: 'flex' }}>
                            <Elements onRef={(elements_view) => { this.elements_view = elements_view }} />
                        </div>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <Monitor />
                    </div>
                </div>
            </div >

        )
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
        appiumServerStatus().then(res => {
            const result = res.data;
            console.log(JSON.stringify(result));
            const isStarted = result.data.isStarted;
            const hanlder = result.data.handler;
            const owner = result.data.owner;
            if (owner && owner.hasOwnProperty('ip')) {
                this.setState({
                    ownerIP: owner.ip
                })
            }
            if (isStarted) {
                this.setState({
                    status: 'start'
                });
                if (hanlder && hanlder.hasOwnProperty('caps') && hanlder.hasOwnProperty('cfg')) {
                    this.setState({
                        isCreateSessionReady: false,
                        isKillSessionReady: true
                    })
                } else {
                    this.setState({
                        isCreateSessionReady: true,
                        isKillSessionReady: false
                    })
                }
            } else {
                this.setState({
                    status: 'stop',
                    isCreateSessionReady: false,
                    isKillSessionReady: false
                });
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

    handleChangeKeepSessionLoop(e) {
        const value = e.target.value;
        if (value == 'keep') {
            if (this.sessionId) {
                runKeepAlive(this.sessionId);
                this.setState({
                    isRunKeepSessionLoop: true
                });
            }
        } else if (value == 'kill') {
            killKeepAlive();
            this.setState({
                isRunKeepSessionLoop: false
            });
        }
    }

    handleChangeAppiumServer(e) {
        const value = e.target.value;
        if (value == 'start') {
            startAppiumServer().then(res => {
                const result = res.data;
                message.success(JSON.stringify(result));
                this.setState({
                    status: 'start'
                });
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
        if (model && platform && pkg && activity && this.userId) {
            createSession(model, platform, pkg, activity, this.userId).then(res => {
                const result = res.data;
                console.log(JSON.stringify(result));
                const id = result.data;
                if (id) {
                    this.sessionId = id;
                    runKeepAlive(this.sessionId);
                    this.setState({
                        isRunKeepSessionLoop: true
                    });
                    this.screen_view.handleUpdateView(id);
                    this.elements_view.handleUpdateView(id);
                    // window.open('http://localhost:8000/#/main', '_blank').focus();
                    // window.localStorage.setItem('sessionId', id);
                }
            }).catch(error => {
                message.error(error.message);
            })
        } else {
            message.error(`mode:${model}, platform:${platform}, package:${pkg}, activity:${activity}`);
        }
    }

    handleKillSession() {
        killSession(this.userId).then(res => {
            const result = res.data;
            message.success(JSON.stringify(result));
            console.log(JSON.stringify(result));
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

export default App;