import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import Sync from './Sync'
import Async from './Async';

ReactDOM.render(<Fragment>
  <p>项目地址：<a href="https://github.com/shenghanqin/react-address-picker-cc">react-address-picker-cc</a></p>
  <br />
  <Sync />
  <Async />
</Fragment>, document.getElementById('root'))
