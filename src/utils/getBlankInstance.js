const getBlankInstance = (template, initialValue = 0) => {
  return Object.keys(template).reduce((blank, extention) => {
    blank[extention] = initialValue
    return blank
  }, {})
}

export default getBlankInstance
