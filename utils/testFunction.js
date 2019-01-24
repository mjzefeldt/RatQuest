const testFunction = (func, input, output) => {
  let result = ''
  try {
    console.log('asl', func)
    for (let i = 0; i < input.length; i++) {
      let theirResult = func(...input[i])
      if (theirResult !== output[i])
        result += `expected: ${
          output[i]
        } actual: ${theirResult} for inputs: ${input[i].join(', ')}\n`
    }
    if (result === '') result = 'success'
  } catch (e) {
    console.log('test func e', e)
    result = e.toString()
  }
  return result
}

export default testFunction
