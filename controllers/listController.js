const {promisify} = require('util')
const jwt = require('jsonwebtoken');
const List = require('../models/listModel');
const User = require('../models/userModel')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = id => {
  return jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

exports.getAllList = catchAsync(async (req, res, next) => { 
  console.log(req.params.uid)
  const userLists = await List.find({ownerId: req.params.uid})

  if(!userLists) {
    return next(new AppError('No list found matching this id, please create a list'))
  }

  res.status(201).json({
    status: 'success',
    data: {
      list: userLists
    }
  })
  
})

exports.createList = catchAsync(async (req, res, next) => {
  const newList = await List.create(req.body)
  console.log('new List', newList)
  res.status(201).json({
    status: 'success',
    data: {
      list: newList
    }
  })
})

exports.updateList = catchAsync(async (req, res, next) => {
  const list = await List.findByIdAndUpdate(req.params.id, {name: req.body.name}, {
    new: true,
    runValidators: true
  })

  if(!list) {
    return next(new AppError('No list found with that ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      list
    }
  })
})

exports.deleteList = catchAsync(async (req, res, next) => {
  const list = await List.findByIdAndDelete(req.param.id)

  if(!list) {
    return next(new AppError('No list found with that ID', 404))
  }

  res.status(204).json({
    status: 'success',
    data: null
  })
})

exports.createTask = catchAsync(async (req, res, next) => {
  const newTask = req.body

  if(!newTask) {
    return next(new AppError('please add a task', 400))
  }

  const list = await List.findById(req.params.id)
  list.tasks.push(newTask)
  const newList = await List.findByIdAndUpdate(req.params.id, {tasks: list.tasks}, {
    new: true,
    runValidators: true
  })

  res.status(201).json({
    status: 'success',
    data: newList.tasks
  })
})

exports.updateTask = catchAsync(async (req, res, next) => {
  if(!req.body) {
    return 
  }

  const list = await List.findById(req.params.id)
  const taskID = req.params.taskID
  const taskIndex = await list.tasks.findIndex((task) => (task._id).toString() === taskID)
  // N.B typeof of any thing mongodb returns is an object
  const state = {...(list.tasks[taskIndex]).toObject()}
  list.tasks[taskIndex] = {...state, ...req.body}

  const newList = await List.findByIdAndUpdate(req.params.id, list, {
    new: true,
    runValidators: true
  })

  res.status(201).json({
    status: 'success',
    data: {
      updated:  list.tasks[taskIndex],
      newList
    }
  })
})

exports.deleteTask = catchAsync(async (req, res, next) => {
  const list = await List.findById(req.params.id)
  const taskID = req.params.taskID
  const taskIndex = await list.tasks.findIndex((task) => (task._id).toString() === taskID)
  list.tasks.splice(taskIndex, 1)

  const newList = await List.findByIdAndUpdate(req.params.id, list, {
    new: true,
    runValidators: true
  })

  res.status(204).json({
    status: 'success',
    data: null
  })
})


