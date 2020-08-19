const express = require('express');
const listController = require('../controllers/listController');
const router = express.Router();

router
  .route('/')
  .post(listController.createList)

router
  .route('/:uid')
  .get(listController.getAllList)

router
  .route('/:id')
  .patch(listController.updateList)
  .post(listController.createTask)
  .delete(listController.deleteList)

router
  .route('/:id/:taskID')
  .patch(listController.updateTask)
  .delete(listController.deleteTask)

module.exports = router