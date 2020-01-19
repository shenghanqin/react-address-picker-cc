import * as React from 'react'
// import ReactDOM from 'react-dom'
import * as PropTypes from 'prop-types'
import styles from './styles.css'
import classNames from 'classnames/bind'

const PICKER_CLASSNAME = 'rap-address-picker'

let cx = classNames.bind(styles)

interface AddressProps {
  // /**
  //  * 自定义className
  //  *
  //  * @type {(string | string[] | { [key: string]: boolean })}
  //  */
  // className?: string | string[] | { [key: string]: boolean },

  // /**
  //  * 自定义Style
  //  * 
  //  * @type {(string | CSSProperties)}
  //  */
  // customStyle?: string | React.CSSProperties
}

interface AddressProps {
  /**
   * 自定义className
   *
   * @type {(string | string[] | { [key: string]: boolean })}
   */
  className?: string | string[] | { [key: string]: boolean },

  /**
   * 自定义Style
   * 
   * @type {(string | React.CSSProperties)}
   */
  customStyle?: string | React.CSSProperties
}

// interface AddressState {
//   abc: string
// }



export default class AddressPicker extends React.Component<AddressProps> {
  // public static defaultProps: AddressProps
  static propTypes: PropTypes.InferProps<AddressProps>

  render() {
    return <div className={cx(PICKER_CLASSNAME)}>123</div>
  }

}

AddressPicker.propTypes = {
  className: PropTypes.string,
  customStyle: PropTypes.object
}




