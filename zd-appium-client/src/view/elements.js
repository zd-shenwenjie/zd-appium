import React, { Component } from 'react';
import { Button, Tree, List, Typography, message } from 'antd';
import 'antd/dist/antd.css';
import {
    readAppSource
} from '../http/api';
class Elements extends Component {
    constructor(props) {
        super(props);
        this.state = {
            elements: [
                // {
                //     title: 'parent 1',
                //     key: '0-0',
                //     children: [
                //         {
                //             title: 'parent 1-0',
                //             key: '0-0-0',
                //             children: [
                //                 { title: 'leaf', key: '0-0-0-0' },
                //                 { title: 'leaf', key: '0-0-0-1' },
                //                 { title: 'leaf', key: '0-0-0-2' },
                //             ],
                //         },
                //         {
                //             title: 'parent 1-1',
                //             key: '0-0-1',
                //             children: [
                //                 {
                //                     title: 'leaf',
                //                     key: '0-0-1-0'
                //                 }],
                //         },
                //         {
                //             title: 'parent 1-2',
                //             key: '0-0-2',
                //             children: [
                //                 {
                //                     title: 'leaf',
                //                     key: '0-0-2-0'
                //                 },
                //                 {
                //                     title: 'leaf',
                //                     key: '0-0-2-1',
                //                 },
                //             ],
                //         },

                //         {
                //             title: 'parent 1-3',
                //             key: '0-0-3',
                //             children: [
                //                 {
                //                     title: 'leaf',
                //                     key: '0-0-3-0'
                //                 },
                //                 {
                //                     title: 'leaf',
                //                     key: '0-0-3-1',
                //                 },
                //             ],
                //         },

                //         {
                //             title: 'parent 1-4',
                //             key: '0-0-4',
                //             children: [
                //                 { title: 'leaf', key: '0-0-4-0' },
                //                 {
                //                     title: 'leaf',
                //                     key: '0-0-4-1',
                //                 },
                //             ],
                //         },

                //         {
                //             title: 'parent 1-5',
                //             key: '0-0-5',
                //             children: [
                //                 { title: 'leaf', key: '0-0-5-0' },
                //                 {
                //                     title: 'leaf',
                //                     key: '0-0-5-1',
                //                 },
                //             ],
                //         },

                //         {
                //             title: 'parent 1-6',
                //             key: '0-0-6',
                //             children: [
                //                 { title: 'leaf', key: '0-0-6-0' },
                //                 {
                //                     title: 'leaf',
                //                     key: '0-0-6-1',
                //                 },
                //             ],
                //         }
                //     ]
                // }
            ],
            element: [
                // 'Racing car sprays burning fuel into crowd.',
                // 'Japanese princess to wed commoner.',
                // 'Australian walks 100km after outback crash.',
                // 'Man charged over missing wedding girl.',
                // 'Los Angeles battles huge wildfires.',
                // 'Racing car sprays burning fuel into crowd.',
                // 'Japanese princess to wed commoner.',
                // 'Australian walks 100km after outback crash.',
                // 'Man charged over missing wedding girl.',
                // 'Los Angeles battles huge wildfires.',
                // 'Racing car sprays burning fuel into crowd.',
                // 'Japanese princess to wed commoner.',
                // 'Australian walks 100km after outback crash.',
                // 'Man charged over missing wedding girl.',
                // 'Los Angeles battles huge wildfires.'
            ]
        }
    }

    render() {
        return (
            <div >

                <div style={{ width: '100%', height: "40px", background: 'lightgray' }}>
                    <Button style={{ width: '20%', height: '30px', margin: '5px', float: 'right' }} onClick={this.handleAppCrawler.bind(this)}>
                        App Crawler
                    </Button>
                </div >

                <div style={{ width: '100%', height: "500px", display: 'flex' }}>
                    <div style={{ width: '50%', height: '100%' }} >
                        <Tree
                            height={500}
                            showLine={true}
                            defaultExpandedKeys={['0-0-0']}
                            onSelect={this.handleSelectElement.bind(this)}
                            treeData={this.state.elements}
                        />
                    </div>
                    <div style={{ width: '50%', height: '100%' }} >
                        <List
                            style={{ width: '100%', height: '100%', overflow: 'auto' }}
                            size={'small'}
                            // header={<div>Header</div>}
                            // footer={<div>Footer</div>}
                            bordered
                            dataSource={this.state.element}
                            renderItem={item => (
                                <List.Item>
                                    <Typography.Text mark>[ITEM]</Typography.Text> {item}
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>
        )
    }

    handleSelectElement(selectedKeys, info) {
        console.log(selectedKeys, info);
    }

    handleAppCrawler() {
        readAppSource().then(res => {
            const result = res.data;
            console.log(JSON.stringify(result));
        }).catch(error => {
            message.error(error.message);
        });
    }
}

export default Elements;