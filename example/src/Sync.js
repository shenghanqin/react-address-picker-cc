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
    const { dataSource, selectedIdList } = this.state
    return (
      <div>
        <h1>同步获取</h1>
        <input onClick={this.showPicker} value={this.state.address} placeholder="请选择地区" readOnly style={{ width: '90%' }} />
        <AddressPicker 
          dataSource={dataSource}
          selectedIdList={selectedIdList}
          text='这是收货地址组件'
          ref={e => (this.ecRef = e)}
          onAddressChange={this.onAddressChange}
          onClose={this.hidePicker}
        />
        <br />
        <br /><br /><br /><br /><br />
      </div>
    )
  }
}
