import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styles from './styles.css'
import classNames from 'classnames/bind'

const PICKER_CLASSNAME = 'rap-address-picker'

let cx = classNames.bind(styles)

const setTransform = (nodeStyle, value) => {
  nodeStyle.transform = value
  nodeStyle.webkitTransform = value
}

// 获取选中的选项
const getSelectedRows = ({ selectedIdList, dataSource }) => {
  const selectedRows = []
  if (selectedIdList && dataSource && selectedIdList.length) {
    const loop = (ds, level) => {
      const v = selectedIdList[level]
      const rows = ds.filter(item => item.id === v)
      if (rows.length) {
        selectedRows.push(rows[0])
        if (rows[0].subArea && rows[0].subArea.length && selectedIdList.length === level + 1) {
          selectedRows.push({})
        } else if (rows[0].subArea && rows[0].subArea.length) {
          loop(rows[0].subArea, ++level)
        }
      }
    }
    loop(dataSource, 0)
  }
  if (!selectedRows.length) {
    return {
      currentLevel: 0,
      selectedRows: [{}]
    }
  }
  return {
    currentLevel: selectedRows.length - 1,
    selectedRows
  }
}

export default class AddressPicker extends React.PureComponent {
  touch = {}

  constructor(props) {
    super(props)
    this.PREFIX = props.prefixCon || 'rap'
    this.PICKER_CLASSNAME = this.PREFIX + '-address-picker'
    
    // 获取选中的选项
    const { currentLevel, selectedRows } = getSelectedRows(props)
    this.state = {
      // 异步加载二级后，从props中获取一级的省id
      asyncIdOneFromProps: 0,
      selectedRows: selectedRows,
      currentLevel: currentLevel,
      show: false
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { asyncIdOne, selectedIdList, dataSource, isAsyncData } = nextProps
    const { asyncIdOneFromProps, selectedRows: prevSelectedRows } = prevState

    // 初始化数据
    if (selectedIdList.length >= 1 && dataSource.length && prevSelectedRows[0] && (
      !prevSelectedRows[0].id
    )) {
      let oneId = selectedIdList[0]
      const rows = dataSource.filter(item => item.id === oneId)
      if (rows.length && rows[0].subArea && rows[0].subArea.length) {
        const { selectedRows, currentLevel } = getSelectedRows(nextProps)
        return {
          currentLevel,
          selectedRows
        }
      }
    } else if (isAsyncData && asyncIdOne > 0 && asyncIdOneFromProps !== asyncIdOne) {
      // 异步加载数据后
      const { selectedRows } = getSelectedRows({
        selectedIdList: [asyncIdOne],
        dataSource: nextProps.dataSource
      })

      return {
        asyncIdOneFromProps: asyncIdOne,
        selectedRows
      }
    }

    return null
  }

  pickerStatusChange = (show) => {
    if (show) {
      this.doAnimation()
      this.bindEvent()
    }
    this.props.pickerStatusChange(show)
  }

  componentWillUnmount() {
    this.unBindEvent()
  }

  componentDidUpdate(prevProps, prevState) {
    const { show, asyncIdOneFromProps } = this.state

    // TODO
    if (show && (
      prevState.currentLevel !== this.state.currentLevel
      || (this.state.currentLevel === 1 && asyncIdOneFromProps > 0)
    )) {
      this.doAnimation()
    }
  }

  show = () => {
    this.setState({
      show: true
    }, () => this.pickerStatusChange(this.state.show))
  }

  hide = () => {
    this.setState({
      // 关掉后重置数据
      selectedRows: [{}],
      currentLevel: 0,
      show: false
    }, () => this.pickerStatusChange(this.state.show))
  }

  onTouchStart = (e) => {
    this.touch.startX = e.touches[0].clientX
    this.touch.startY = e.touches[0].clientY
    this.touch.moved = false
  }

  onTouchMove = (e) => {
    const { currentLevel, selectedRows } = this.state
    const moveX = e.touches[0].clientX
    const moveY = e.touches[0].clientY
    const deltaX = moveX - this.touch.startX
    const deltaY = moveY - this.touch.startY

    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    let mainWrapRef = this.mainWrapRef
    if (!mainWrapRef) return

    let innerWidth = mainWrapRef.offsetWidth

    const curOffsetWidth = -(currentLevel * innerWidth)
    const maxOffsetWidth = -((selectedRows.length - 1) * innerWidth)
    const offsetWidth = Math.min(0, Math.max(maxOffsetWidth, curOffsetWidth + deltaX))
    if (offsetWidth >= 0 || offsetWidth <= maxOffsetWidth) return
    if (!this.touch.moved) this.touch.moved = true
    e.preventDefault()
    setTransform(this.listWrapRef.style, `translate3d(${offsetWidth}px, 0, 0)`)

    const percent = Math.abs(deltaX / innerWidth)

    this.touch.targetIdx =
      percent >= 0.1
        ? (deltaX < 0 ? currentLevel + 1 : currentLevel - 1)
        : currentLevel
  }

  onTouchEnd = () => {
    const { currentLevel } = this.state
    if (!this.touch.moved) return
    let mainWrapRef = this.mainWrapRef
    if (!mainWrapRef) return
    let innerWidth = mainWrapRef.offsetWidth
    if (this.touch.targetIdx !== currentLevel) {
      this.setState({
        currentLevel: this.touch.targetIdx
      })
    } else {
      // 没有移动到别的级别，就返回当前
      setTransform(this.listWrapRef.style, `translate3d(-${(currentLevel) * innerWidth}px, 0, 0)`)
    }
  }

  bindEvent = () => {
    const wrap = this.listWrapRef
    if (wrap) {
      wrap.addEventListener('touchstart', this.onTouchStart, false)
      wrap.addEventListener('touchmove', this.onTouchMove, false)
      wrap.addEventListener('touchend', this.onTouchEnd, false)
    }
  }

  unBindEvent = () => {
    const wrap = this.listWrapRef
    if (wrap) {
      wrap.removeEventListener('touchstart', this.onTouchStart, false)
      wrap.removeEventListener('touchmove', this.onTouchMove, false)
      wrap.removeEventListener('touchend', this.onTouchEnd, false)
    }
  }

  doAnimation = () => {
    const { currentLevel } = this.state
    this.setItemCenter()

    const navItem = this.nav.children[currentLevel]
    // TODO 写法
    if (navItem && !navItem.classList.contains('active')) {
      this.navLineRef.style.width = `${navItem.offsetWidth}px`
      this.navLineRef.style.left = `${navItem.offsetLeft}px`
      this.navLineRef.style.bottom = `${this.nav.clientHeight - (navItem.offsetTop + navItem.offsetHeight)}px`

      // TODO 这一条可以避开？
      const activeItem = document.querySelector(`.${PICKER_CLASSNAME}-nav-item.active`)

      if (activeItem) {
        activeItem.classList.remove('active')
      }

      setTimeout(() => {
        let _toActiItem = document.querySelector(`#nav-item-${currentLevel}`)
        _toActiItem && _toActiItem.classList.add('active')
      }, 300)
    }
  }

  // 当前高亮的导航项 居中
  setItemCenter = () => {
    let listWrapRef = this.listWrapRef
    let listWrapChilds = listWrapRef.children
    const { selectedRows } = this.state
    selectedRows.forEach((row, rowIndex) => {
      // TODO 判断不需要居中的？？？
      let listElm = listWrapChilds[rowIndex]
      if (!listElm) return

      // 当没有下级或者下级的总高度没有超过父级高度，都pass
      if (!listElm.children.length || listElm.children.length * 40 < listElm.offsetHeight) return

      if (!row.id) {
        // 当未选择时，应该滚到顶部
        listElm.scrollTop = 0
        return
      }

      // 滚到中间
      let activeItem = listElm.querySelector(`.${PICKER_CLASSNAME}-body-item.active`)
      if (!activeItem) return

      let listElmHeight = listElm.offsetHeight
      let elmHeight = activeItem.offsetHeight
      let dataY = activeItem.offsetTop
      let scrollY = dataY - listElmHeight / 2 + elmHeight - 10
      listElm.scrollTop = scrollY
    })
  }

  onSelectedRow = (item, level) => () => {
    const { currentLevel } = this.state
    let { selectedRows } = this.state
    const { isAsyncData } = this.props

    // 大于一级才可以没有下级
    const isEnd = (level || !isAsyncData) && (!item.subArea || !item.subArea.length)

    if (selectedRows[level]) {
      const args = [level, 1, item]
      if (isAsyncData && level === 0 && item.subArea && !item.subArea.length) {
        this.props.getOneLevelData(item, level)
      }

      if (item.subArea && item.subArea.length && currentLevel + 1 >= selectedRows.length) {

        args.push({})
      } else if (currentLevel + 1 < selectedRows.length) {
        selectedRows = selectedRows.slice(0, currentLevel + 1)

        args.push({})
      }
      selectedRows.splice(...args)


      this.setState({
        selectedRows: [...selectedRows],
        currentLevel: isEnd ? level : level + 1
      }, () => {
        isEnd && this.hide()
      })
    }

    if (isEnd) {
      let _selectList = selectedRows.filter(_item => typeof _item.id !== 'undefined').map(_item => {
        return {
          id: _item.id,
          areaName: _item.areaName
        }
      })
      this.props.onAddressChange(_selectList)
    }
  }

  onSelectedNav = (level) => () => {
    this.setState({
      currentLevel: level
    })
  }

  onNavBarMove = () => {
    this.navLineRef.style.width = 0
  }

  renderNextData = (ds, level = 0) => {
    const { selectedRows } = this.state
    const row = selectedRows[level] || {}
    const lists = level > 0 ? selectedRows[level - 1].subArea : ds

    if (!lists || !lists.length) {
      return null
    }
    return (
      <div key={level} className={`${PICKER_CLASSNAME}-body-list`}>
        {lists.map((item) => (
          <div
            key={item.id}
            className={
              cx(`${PICKER_CLASSNAME}-body-item`, { active: row.id === item.id })
            }
            onClick={this.onSelectedRow(item, level)}
          ><span>{item.areaName}</span><i /></div>
        ))}
      </div>
    )
  }

  render() {
    const { selectedRows, show, currentLevel } = this.state
    const { dataSource, navTips, title, className } = this.props
    // 这一条是不是不太好
    const wrapStyles = {
      width: `${selectedRows.length * 100}%`,
    }

    if (selectedRows.length === 1) {
      wrapStyles.transform = 'translate3d(0, 0, 0)'
    } else if (currentLevel > 0) {
      wrapStyles.transform = `translate3d(-${(currentLevel / selectedRows.length) * 100}%, 0, 0)`
    }

    let node = (
      <div className={cx(`${PICKER_CLASSNAME} ${className}`, { [`${PICKER_CLASSNAME}-visible`]: show })}>
        <div className={`${PICKER_CLASSNAME}-modal`}>
          <div className={`${PICKER_CLASSNAME}-main-wrap`} ref={w => (this.mainWrapRef = w)}>
            <div className={`${PICKER_CLASSNAME}-title`}>
              {title}
            </div>
            <div className={`${PICKER_CLASSNAME}-nav`}>
              <div className={`${PICKER_CLASSNAME}-nav-list`} ref={nav => (this.nav = nav)} onTouchMove={this.onNavBarMove}>
                {
                  selectedRows.map((item, index) => (
                    <div key={index}
                      onClick={this.onSelectedNav(index)}
                      id={`nav-item-${index}`}
                      className={`${PICKER_CLASSNAME}-nav-item`}
                    >
                      {item.id ? item.areaName : navTips}
                    </div>
                  ))
                }
              </div>
              <span className={`${PICKER_CLASSNAME}-nav-active`} ref={navline => (this.navLineRef = navline)} />
            </div>
            <div className={`${PICKER_CLASSNAME}-body`}>
              <div className={`${PICKER_CLASSNAME}-body-wrap`} ref={wrap => (this.listWrapRef = wrap)} style={wrapStyles}>
                {
                  selectedRows.map((item, index) => this.renderNextData(dataSource, index))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )

    return ReactDOM.createPortal(
      node,
      document.body
    )
  }
}

AddressPicker.propTypes = {
  /**
   * 数据源，多维数组
   */
  dataSource: PropTypes.array.isRequired,
  /**
   * 自定义组件标题
   */
  title: PropTypes.node,
  /**
   * 自定义 ClassName
   */
  prefixCon: PropTypes.string,
  /**
   * 自定义 ClassName
   */
  className: PropTypes.string,
  /**
   * 地址导航提示文字
   */
  navTips: PropTypes.string,
  /**
   * 初始化地址的id数组
   */
  selectedIdList: PropTypes.array,
  /**
   * 是否异步获取数据
   */
  isAsyncData: PropTypes.bool,
  /**
   * 异步数据返回的一级id
   */
  asyncIdOne: PropTypes.number,
  /**
   * 初始化地址的id数组
   */
  getOneLevelData: PropTypes.func,
  /**
   * 初始化地址的id数组
   */
  onAddressChange: PropTypes.func,
  /**
   * pickerStatusChange
   */
  pickerStatusChange: PropTypes.func
}

AddressPicker.defaultProps = {
  navTips: '请选择',
  title: '选择地址',
  className: '',
  isAsyncData: false,
  asyncIdOne: 0,
  selectedIdList: [],
  getOneLevelData: () => { },
  pickerStatusChange: () => { },
  onAddressChange: () => { }
}
