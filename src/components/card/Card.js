import React from 'react'
import './style.css'

import Header from './extentions/Header'
import Image from './extentions/Image'
import Description from './extentions/Description'
import Footer from './extentions/Footer'

import { blueprint } from './config'
import registerChildren from '../../utils/registerChildren'
import groupChildren from '../../utils/groupChildren'

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

    const groups = groupChildren(blueprint, props.children)

    this.groups = groups
  }

  render() {
    return <article className='card'>{this.groups.Header[0]}</article>
  }
}

export default Card
