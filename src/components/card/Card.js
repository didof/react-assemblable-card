import React from 'react'
import './style.css'

import Header from './extentions/Header'
import Image from './extentions/Image'
import Description from './extentions/Description'
import Footer from './extentions/Footer'

import registerChildren from '../../utils/registerChildren'
import { blueprint } from './config'

class Card extends React.Component {
  static Header = Header
  static Image = Image
  static Description = Description
  static Footer = Footer

  constructor(props) {
    super(props)

    const { children } = props
    if (!children) return

    registerChildren(blueprint, props.children, true)
  }

  render() {
    return <article className='card'>{this.props.children}</article>
  }
}

export default Card
