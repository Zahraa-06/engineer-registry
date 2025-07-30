const Engineer = require('../../models/engineer.js')

// API Engineer controllers - returns JSON responses
const apiController = {
  // Get all engineers for authenticated user
  index(req, res) {
    res.json(res.locals.data.engineers)
  },

  // Get single engineer
  show(req, res) {
    res.json(res.locals.data.engineer)
  },

  // Create new engineer
  create(req, res) {
    res.status(201).json(res.locals.data.engineer)
  },

  // Delete engineer
  destroy(req, res) {
    res.status(200).json({ message: 'Engineer successfully deleted' })
  }
}

module.exports = apiController 