import React from 'react'
import getBlankInstance from './getBlankInstance'

const registerChildren = (blueprint, children, strict = false) => {
  const counter = getBlankInstance(blueprint)

  React.Children.forEach(children, child => {
    const { name } = child.type

    counter[name]++
  })

  const anomalies = Object.keys(blueprint).filter(extention => {
    if (strict) return counter[extention] !== blueprint[extention]
    return counter[extention] > blueprint[extention]
  })

  if (Boolean(anomalies.length)) {
    throw new Error(`The structure used does not respect the blueprint.
    Please check ${anomalies.join(' ')}`)
  }

  return counter
}

export default registerChildren
