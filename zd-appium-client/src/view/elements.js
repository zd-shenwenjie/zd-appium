import React, { Component } from 'react';
import { Button, Tree, List, message } from 'antd';
import 'antd/dist/antd.css';
import {
    readAppSource
} from '../http/api';
class Elements extends Component {
    constructor(props) {
        super(props);
        this.sessionId = '';
        this.elementAttributes = {};
        this.state = {
            elements: [],
            selectedAttributes: []
        }
        console.log('Elements received sessionId =', this.props.sessionId);
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    render() {
        return (
            <div >
                <div style={{ width: '1400px', height: "40px", background: 'lightgray' }}>
                    <Button
                        style={{ width: '150px', height: '30px', margin: '5px' }}
                        onClick={this.handleReadAppSource.bind(this)}
                    >
                        App Source
                    </Button>
                </div >

                <div style={{ width: '1400px', height: "500px", display: 'flex' }}>
                    <div style={{ width: '800px', height: '100%' }} >
                        <Tree
                            height={500}
                            showLine={true}
                            onSelect={this.handleSelectElement.bind(this)}
                            treeData={this.state.elements}
                        />
                    </div>
                    <div style={{ width: '600px', height: '100%' }} >
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

    handleUpdateView(sessionId) {
        this.sessionId = sessionId;
        this.handleReadAppSource();
    }

    handleSelectElement(selectedKeys) {
        const selectedKey = selectedKeys[0];
        // console.log('key:' + selectedKey);
        // console.log('keys:' + JSON.stringify(Object.keys(this.elementAttributes)))
        if (selectedKey && this.elementAttributes.hasOwnProperty(selectedKey)) {
            const attributes = this.elementAttributes[selectedKey];
            // console.log('attributes:' + JSON.stringify(attributes));
            const selectedAttributes = [];
            selectedAttributes.push(`xpath = "${selectedKey}"`);
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
        if (this.sessionId) {
            readAppSource(this.sessionId).then(res => {
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
                            let resId = attributes && attributes.hasOwnProperty('resource-id') ? ` resource-id=${attributes['resource-id']}` : '';
                            let desc = attributes && attributes.hasOwnProperty('content-desc') ? ` content-desc=${attributes['content-desc']}` : '';
                            const children = node.children;
                            const arr = tagName.split('_');
                            const title = `<${arr[0]}[${arr[1]}]${resId}${desc}> `
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
                    console.log(JSON.stringify(source));
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