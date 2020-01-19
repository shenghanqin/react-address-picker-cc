import * as React from 'react'
// import ReactDOM from 'react-dom'
import * as PropTypes from 'prop-types'
import styles from './styles.css'
import classNames from 'classnames/bind'

const PICKER_CLASSNAME = 'rap-address-picker'

let cx = classNames.bind(styles)

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
  dataSource: any,
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
  selectedIdList: any,
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
  getOneLevelData: () => void,
  /**
   * 初始化地址的id数组
   */
  onAddressChange: () => void,
  /**
   * pickerStatusChange
   */
  pickerStatusChange: () => void
}

interface AddressState {
  asyncIdOneFromProps: number
  selectedRows: any
  currentLevel: any
  show: boolean
}

// interface selectedIdListProps {
//   id: 123
// }

export const getSelectedRows = ({ selectedIdList, dataSource }: { selectedIdList: any, dataSource : any }): any => {
  const selectedRows: any = []
  if (selectedIdList && dataSource && selectedIdList.length) {
    const loop = (ds: any, level: number) => {
      const v = selectedIdList[level]
      const rows = ds.filter((item: { id: number }) => item.id === v)
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

  constructor(props: AddressProps) {
    super(props)

    // 获取选中的选项
    const { currentLevel, selectedRows } = getSelectedRows(props)
    this.state = {
      // 异步加载二级后，从props中获取一级的省id
      asyncIdOneFromProps: 0,
      selectedRows,
      currentLevel,
      show: false
    }
  }

  render() {
    return <div className={cx(PICKER_CLASSNAME)}>123</div>
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




