import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import Sync from './Sync'
import Async from './Async';

ReactDOM.render(<Fragment>
  <Sync />
  <Async />
</Fragment>, document.getElementById('root'))
