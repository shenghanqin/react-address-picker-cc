import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as PropTypes from 'prop-types'
import styles from './styles.css'
import classNames from 'classnames/bind'

const PICKER_CLASSNAME = 'rap-address-picker'

let cx = classNames.bind(styles)

interface OneRowProps {
  id?: number,
  areaName?: string,
  subArea?: OneRowProps[]
  length?: number
}

interface AddressProps {
  /**
   * 自定义className
   *
   * @type {(string | string[] | { [key: string]: boolean })}
   */
  className?: string | string[] | { [key: string]: boolean }

  /**
   * 自定义Style
   * 
   * @type {(string | React.CSSProperties)}
   */
  customStyle?: string | React.CSSProperties
  /**
   * TODO 数据源，多维数组
   */
  dataSource: OneRowProps[],
  /**
   * 自定义组件标题
   */
  title: string,
  /**
   * 地址导航提示文字
   */
  navTips: string,
  /**
   * TODO ! 初始化地址的id数组
   */
  selectedIdList: number[],
  /**
   * 是否异步获取数据
   */
  isAsyncData: boolean,
  /**
   * 自定义 关闭方法
   */
  onClose: () => void,
  /**
   * 异步数据返回的一级id
   */
  asyncIdOne: number,
  /**
   * 初始化地址的id数组
   */
  getOneLevelData: (item: OneRowProps, level: number) => void,
  /**
   * 初始化地址的id数组
   */
  onAddressChange: (selectRowList: OneRowProps) => void,
  /**
   * pickerStatusChange
   */
  pickerStatusChange: (show: boolean) => void
}

interface TouchProps {
  startX: number
  startY: number
  moved: boolean
  targetIdx: number
}


interface AddressState {
  asyncIdOneFromProps: number
  selectedRows: any
  currentLevel: any
  show: boolean
  touch: TouchProps
}

export const getSelectedRows = ({ selectedIdList, dataSource }: { selectedIdList: number[], dataSource: OneRowProps[] }): { currentLevel: number, selectedRows: OneRowProps[] } => {
  const selectedRows: OneRowProps[] = []
  if (selectedIdList && dataSource && selectedIdList.length) {
    const loop = (ds: OneRowProps[], level: number) => {
      const v = selectedIdList[level]
      const rows = ds.filter((item: OneRowProps) => item.id === v)
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


export default class AddressPicker extends React.Component<AddressProps, AddressState> {
  static defaultProps: AddressProps
  static propTypes: PropTypes.InferProps<AddressProps>
  mainWrapRef: any
  listWrapRef: any
  navRef: any
  navLineRef: any
  touch: any = {}
  
  constructor(props: AddressProps) {
    super(props)
    
    // 获取选中的选项
    const { currentLevel, selectedRows } = getSelectedRows(props)
    console.log('selectedRows :', selectedRows, currentLevel);
    this.state = {
      // 异步加载二级后，从props中获取一级的省id
      asyncIdOneFromProps: 0,
      selectedRows,
      currentLevel,
      show: false,
      touch: {
        startX: 0,
        startY: 0,
        moved: false,
        targetIdx: -1
      }
    }
  }

  pickerStatusChange = (show: boolean) => {
    if (show) {
      this.doAnimation()
      this.bindEvent()
    }
    this.props.pickerStatusChange(show)
  }

  componentWillUnmount() {
    this.unBindEvent()
  }

  componentDidUpdate(prevProps: AddressProps, prevState: AddressState) {
    const { show, asyncIdOneFromProps } = this.state

    // TODO
    if (show && prevProps && (
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

  onTouchStart = (e: any) => {
    this.touch.startX = e.touches[0].clientX
    this.touch.startY = e.touches[0].clientY
    this.touch.moved = false
  }

  onTouchMove = (e: any) => {
    const { currentLevel, selectedRows } = this.state
    const moveX = e.touches[0].clientX
    const moveY = e.touches[0].clientY
    const deltaX = moveX - this.state.touch.startX
    const deltaY = moveY - this.state.touch.startY

    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    let mainWrapRef = this.mainWrapRef
    if (!mainWrapRef) return

    let innerWidth = mainWrapRef.offsetWidth

    const curOffsetWidth = -(currentLevel * innerWidth)
    const maxOffsetWidth = -((selectedRows.length - 1) * innerWidth)
    const offsetWidth = Math.min(0, Math.max(maxOffsetWidth, curOffsetWidth + deltaX))
    if (offsetWidth >= 0 || offsetWidth <= maxOffsetWidth) return
    if (!this.state.touch.moved) this.state.touch.moved = true
    e.preventDefault()
    
    this.listWrapRef.style.transform = `translate3d(${offsetWidth}px, 0, 0)`

    const percent = Math.abs(deltaX / innerWidth)

    this.state.touch.targetIdx =
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
      this.listWrapRef.style = `translate3d(-${(currentLevel) * innerWidth}px, 0, 0)`
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

    const navItem = this.navRef.children[currentLevel]
    // TODO 写法
    if (navItem && !navItem.classList.contains('active')) {
      this.navLineRef.style.width = `${navItem.offsetWidth}px`
      this.navLineRef.style.left = `${navItem.offsetLeft}px`
      this.navLineRef.style.bottom = `${this.navRef.clientHeight - (navItem.offsetTop + navItem.offsetHeight)}px`

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
    selectedRows.forEach((row: any, rowIndex: number) => {
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

  onSelectedRow = (item: any, level: number) => () => {
    const { currentLevel } = this.state
    let { selectedRows } = this.state
    const { isAsyncData } = this.props

    // 大于一级才可以没有下级
    const isEnd = (level || !isAsyncData) && (!item.subArea || !item.subArea.length)

    console.log('isEnd :', isEnd);

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
      let _selectList = selectedRows.filter((_item: any) => typeof _item.id !== 'undefined').map((_item: any) => {
        return {
          id: _item.id,
          areaName: _item.areaName
        }
      })

      console.log('_selectList :', _selectList);
      this.props.onAddressChange(_selectList)
    }
  }

  onSelectedNav = (level: number) => () => {
    this.setState({
      currentLevel: level
    })
  }

  onNavBarMove = () => {
    this.navLineRef.style.width = 0
  }

  renderNextData = (ds: any, level = 0, item: any) => {
    const { selectedRows } = this.state
    const row = selectedRows[level] || {}
    // const lists = level > 0 ? item.subArea : ds
    console.log('item :', item)
    const lists = level > 0 ? selectedRows[level - 1].subArea : ds

    if (!lists || !lists.length) {
      return null
    }
    return (
      <div key={level} className={`${PICKER_CLASSNAME}-body-list`}>
        {lists.map((item: any) => (
          <div
            key={item.id}
            className={
              cx(`${PICKER_CLASSNAME}-body-item`, { active: row.id === item.id })
            }
            onClick={this.onSelectedRow(item, level)}
          >{item.areaName}</div>
        ))}
      </div>
    )
  }


  render() {
    const { selectedRows, show, currentLevel } = this.state
    const { dataSource, navTips, title, className, onClose } = this.props

    console.log('dataSource :', dataSource);
    // 这一条是不是不太好
    const wrapStyles: React.CSSProperties = {
      width: `${selectedRows.length * 100}%`
    }

    if (selectedRows.length === 1) {
      wrapStyles.transform = 'translate3d(0, 0, 0)'
    } else if (currentLevel > 0) {
      wrapStyles.transform = `translate3d(-${(currentLevel / selectedRows.length) * 100}%, 0, 0)`
    }

    console.log('selectedRows :', selectedRows);

    let node = (
      <div className={cx(`${PICKER_CLASSNAME} ${className}`, { [`${PICKER_CLASSNAME}-visible`]: show })}>
        <div className={`${PICKER_CLASSNAME}-modal`}>
          <div className={`${PICKER_CLASSNAME}-main-wrap`} ref={w => (this.mainWrapRef = w)}>
            <div className={`${PICKER_CLASSNAME}-title`}>
              {title}
              <div className={`${PICKER_CLASSNAME}-title-close`} onClick={onClose} />
            </div>
            <div className={`${PICKER_CLASSNAME}-nav`}>
              <div className={`${PICKER_CLASSNAME}-nav-list`} ref={nav => (this.navRef = nav)} onTouchMove={this.onNavBarMove}>
                {
                  selectedRows.map((item: any, index: number) => (
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
                  selectedRows.map((item: any, index: number) => this.renderNextData(dataSource, index, item))
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
  className: PropTypes.string,
  /**
   * 自定义样式
   */
  customStyle: PropTypes.object,
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
   * 自定义 关闭方法
   */
  onClose: () => {},
  /**
   * 异步数据返回的一级id
   */
  asyncIdOne: PropTypes.number,
  /**
   * 初始化地址的id数组
   */
  getOneLevelData: () => {},
  /**
   * 初始化地址的id数组
   */
  onAddressChange: () => {},
  /**
   * pickerStatusChange
   */
  pickerStatusChange: () => {}
}

AddressPicker.defaultProps = {
  dataSource: [],
  navTips: '请选择',
  title: '选择地址',
  className: '',
  isAsyncData: false,
  asyncIdOne: 0,
  selectedIdList: [],
  onClose: () => { },
  getOneLevelData: () => { },
  pickerStatusChange: () => { },
  onAddressChange: () => { }
}