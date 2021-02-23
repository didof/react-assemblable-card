import React from 'react'
import getBlankInstance from './getBlankInstance'

const groupChildren = (blueprint, children) => {
  const groups = getBlankInstance(blueprint, [])

  React.Children.forEach(children, child => {
    const { name } = child.type

    groups[name] = [...groups[name], child]
  })

  return groups
}

export default groupChildren
