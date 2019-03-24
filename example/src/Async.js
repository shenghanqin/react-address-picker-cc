import React, { Component } from 'react'
import AddressPicker from 'react-address-picker-cc'
import axios from 'axios'

const request = (method = 'get') => ({
  url,
  data,
  header = {}
}) => {
  // 接口请求添加随机数
  url = `${url}${url.indexOf('?') > 0 ? '&' : '?'}_timestamp=${(new Date()).getTime()}`
  return axios({
    method,
    url,
    data,
    headers: header,
  }).then(res => {
    if (res.status === 200) {
      let result = res.data
      if (result.status === 0) {
        return result.data
      }
      throw result
    }
    throw res.data
  }).catch(err => {
    throw err
  })
}

const getApi = request('get')

export default class AddressPickerAsyncExample extends Component {
  state = {
    address: '',
    dataSource: [],
    // selectedIdList: [],
    selectedIdList: [3, 141, 623],
    // selectedIdList: [3],
    asyncIdOne: 0
  }

  async componentDidMount() {
    const { selectedIdList } = this.state
    await this.loadData()
    if (selectedIdList.length > 0) {
      await this.getOneLevelData({
        id: selectedIdList[0]
      }, 2)
    }
  }


  loadData = async () => {
    await getApi({ url: 'https://www.cctalk.com/webapi/trade/v1.1/user/get_area_info' })
      .then((list) => {
        let dataSource = list.map(item => {
          return {
            ...item,
            subArea: []
          }
        })
        this.setState({
          dataSource
        })

      })
      .catch(error => { console.log('error', error) })
  }

  getOneLevelData = (item = {}, level) => {
    if (!item.id) return
    let _id = item.id
    getApi({ url: 'https://www.cctalk.com/webapi/trade/v1.1/user/get_area_info?areaId=' + _id })
      .then((subList) => {
        const { dataSource } = this.state
        let _index = dataSource.findIndex(item => item.id === _id)
        if (_index >= 0) {
          dataSource[_index].subArea = subList
        }
        this.setState({
          dataSource,
          asyncIdOne: level === 0 ? _id : 0
        })
      })
      .catch(error => { console.log('error', error) })
  }



  onAddressChange = (selectedRows) => {
    this.setState({
      address: selectedRows.map(item => item.areaName).join(','),
      selectedIdList: selectedRows.map(item => item.id),
    })
    console.log('选择值:', selectedRows)
  }

  showPicker = () => {
    this.picker.show()
  }

  hidePicker = () => {
    this.picker.hide()
  }

  render() {
    const { dataSource, selectedIdList, asyncIdOne } = this.state
    // console.log('render ouer :', dataSource);
    return (
      <div>
        <h1>异步获取数据</h1>
        <input onClick={this.showPicker} value={this.state.address} placeholder="请选择收货地址" readOnly style={{ width: '100%' }} />
        <AddressPicker
          ref={picker => this.picker = picker}
          dataSource={dataSource}
          onAddressChange={this.onAddressChange}
          getOneLevelData={this.getOneLevelData}
          selectedIdList={selectedIdList}
          asyncIdOne={asyncIdOne}
          isAsyncData={true}
          onClose={this.hidePicker}
        />
      </div>
    )
  }
}



