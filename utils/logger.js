// extracting logging into its own module
// this makes using external logging service easier

const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  console.error(...params)
}

const logger = {
  info, error
}

module.exports = logger
