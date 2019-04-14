# react-address-picker-cc

[![NPM](https://img.shields.io/npm/v/react-address-picker-cc.svg)](https://www.npmjs.com/package/react-address-picker-cc) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

*  仿京东移动端地址选择组件
*  适配触屏和PC
*  有异步获取收货地址的方法

![](https://n1image.hjfile.cn/res7/2019/03/24/10ba8f07bc315b3a2bd735adf9b7a954.gif)


近期修改计划

- [ ] 增加dialog的mask遮罩层，提供点击mask关闭的方法
- [ ] 尝试添加“规避滚动穿透”，如 `react-locky` 上提供的效果
- [ ] 尝试添加单元测试用例


## Install

```bash
npm install --save react-address-picker-cc
```

## Example

```
cd examples
npm start
```

## Usage

```jsx
import React, { Component } from 'react'
import AddressPicker from 'react-address-picker-cc'
import { district } from './district';


export default class Sync extends Component {
  state = {
    address: '',
    dataSource: district,
    selectedIdList: [340000, 341800, 341824]

  }

  showPicker = () => {
    this.ecRef.show()
  }
  
  hidePicker = () => {
    this.ecRef.hide()
  }

  onAddressChange = (selectedRows) => {
    this.setState({
      address: selectedRows.map(item => item.areaName).join(','),
      selectedIdList: selectedRows.map(item => item.id),
    })
    console.log('选择值:', selectedRows)
  }

  
  render () {
    const { dataSource } = this.state
    return (
      <div>
        <h1>同步获取</h1>
        <input onClick={this.showPicker} value={this.state.address} placeholder="请选择地区" readOnly style={{ width: '100%' }} />
        <AddressPicker 
          dataSource={dataSource}
          text='这是收货地址组件'
          ref={e => (this.ecRef = e)}
          onAddressChange={this.onAddressChange}
          onClose={this.hidePicker}
        />
      </div>
    )
  }
}
```

## Props
<table class="table table-bordered table-striped">
    <thead>
      <tr>
        <th style="width: 100px;">属性名</th>
        <th style="width: 50px;">类型</th>
        <th style="width: 50px;">默认值</th>
        <th>描述</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>title</td>
        <td>String | node</td>
        <td>配送至</td>
        <td>标题</td>
      </tr>
      <tr>
        <td>className</td>
        <td>String</td>
        <td></td>
        <td>跟节点class</td>
      </tr>
      <tr>
        <td>dataSource</td>
        <td>array</td>
        <td></td>
        <td>数据源</td>
      </tr>
      <tr>
        <td>onClose</td>
        <td>Function</td>
        <td></td>
        <td>关闭时回调函数</td>
      </tr>
      <tr>
        <td>onAddressChange</td>
        <td>Function</td>
        <td></td>
        <td>选择完闭时的回调函数; (selectedRows) => {}</td>
      </tr>
      <tr>
        <td>navTips</td>
        <td>string</td>
        <td>请选择</td>
        <td>下一项的提示文字</td>
      </tr>
      <tr>
        <td>pickerStatusChange</td>
        <td>Function</td>
        <td></td>
        <td>Picker展开收齐的回调；(status) => {}</td>
      </tr>
      <tr>
        <td>selectedIdList</td>
        <td>array</td>
        <td></td>
        <td>初始化地址的id数组</td>
      </tr>
      <tr>
        <td>isAsyncData</td>
        <td>boolean</td>
        <td></td>
        <td>是否异步获取数据</td>
      </tr>
      <tr>
        <td>asyncIdOne</td>
        <td>Number</td>
        <td></td>
        <td>异步数据返回的一级id，isAsyncData后有效</td>
      </tr>
      <tr>
        <td>getOneLevelData</td>
        <td>Function</td>
        <td></td>
        <td>获取第二、三层数据的方法，isAsyncData后有效</td>
      </tr>
    </tbody>
</table>

## 参考链接

借鉴了同行的组件 (https://github.com/LANIF-UI/react-picker-address)

## License

MIT © [https://github.com/shenghanqin/](https://github.com/https://github.com/shenghanqin/)
