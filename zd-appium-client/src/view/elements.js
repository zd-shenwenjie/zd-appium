import React, { Component } from 'react';
import { Button, Tree, List, message } from 'antd';
import 'antd/dist/antd.css';
import {
    readAppSource
} from '../http/api';
class Elements extends Component {
    constructor(props) {
        super(props);
        this.elementAttributes = {};
        this.state = {
            elements: [],
            selectedAttributes: []
        }
        console.log('Elements received sessionId =', this.props.sessionId);
    }

    componentDidMount() {
        this.handleReadAppSource();      
    }

    render() {
        return (
            <div >
                <div style={{ width: '100%', height: "40px", background: 'lightgray' }}>
                    <Button
                        style={{ width: '20%', height: '30px', margin: '5px', float: 'right' }}
                        onClick={this.handleReadAppSource.bind(this)}
                    >
                        App Crawler
                    </Button>
                </div >

                <div style={{ width: '100%', height: "500px", display: 'flex' }}>
                    <div style={{ width: '60%', height: '100%' }} >
                        <Tree
                            height={500}
                            showLine={true}
                            onSelect={this.handleSelectElement.bind(this)}
                            treeData={this.state.elements}
                        />
                    </div>
                    <div style={{ width: '40%', height: '100%' }} >
                        <List
                            style={{ width: '100%', height: '100%', overflow: 'auto' }}
                            size={'small'}
                            bordered
                            dataSource={this.state.selectedAttributes}
                            renderItem={item => (
                                <List.Item>
                                 {item}
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>
        )
    }

    handleSelectElement(selectedKeys) {
        const selectedKey = selectedKeys[0];
        // console.log('key:' + selectedKey);
        // console.log('keys:' + JSON.stringify(Object.keys(this.elementAttributes)))
        if (selectedKey && this.elementAttributes.hasOwnProperty(selectedKey)) {
            const attributes = this.elementAttributes[selectedKey];
            // console.log('attributes:' + JSON.stringify(attributes));
            const selectedAttributes = [];
            for (const key of Object.keys(attributes)) {
                const value = attributes[key];
                selectedAttributes.push(`${key} = "${value}"`)
            }
            this.setState({
                selectedAttributes
            })
        }
    }

    handleReadAppSource() {
        if (this.props.sessionId) {
            readAppSource(this.props.sessionId).then(res => {
                const result = res.data;
                const source = result.data;
                if (source) {
                    const attributeMap = {};
                    const parseSource = function (nodes) {
                        const elements = [];
                        const tagNames = Object.keys(nodes);
                        for (const tagName of tagNames) {
                            const element = {};
                            const node = nodes[tagName];
                            const xpath = node.xpath;
                            const attributes = node.attributes;
                            attributeMap[xpath] = attributes;
                            // let resId = attributes && attributes.hasOwnProperty('resource-id') ? ` resource-id=${attributes['resource-id']}` : '';
                            // let desc = attributes && attributes.hasOwnProperty('content-desc') ? ` content-desc=${attributes['content-desc']}` : '';
                            const children = node.children;
                            const title = `<${tagName}>`
                            element['title'] = title;
                            element['key'] = xpath;
                            element['children'] = parseSource(children);
                            elements.push(element);
                        }
                        return elements;
                    }
                    const elements = parseSource(source);
                    this.elementAttributes = attributeMap;
                    this.setState({
                        elements
                    })
                    // console.log('attributes:', JSON.stringify(this.elementAttributes));
                    // console.log(JSON.stringify(source));
                }
            }).catch(error => {
                message.error('read app source error:' + error.message);
            });
        } else {
            message.error('session id is null.');
        }
    }

}

export default Elements;