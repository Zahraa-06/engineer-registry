const express = require('express')
const router = express.Router()
const dataController = require('./authData')
const viewController = require('./authViews')
const engineersViewController = require('../engineer/engineerViews')

router.post('/', dataController.createUser, viewController.redirectToLogin)
router.get('/', viewController.signUp)
router.post('/login', dataController.loginUser, engineersViewController.redirectHome)
router.get('/login', viewController.signIn)
router.put('/:id', dataController.updateUser)
router.delete('/:id', dataController.auth, dataController.deleteUser)

module.exports = router