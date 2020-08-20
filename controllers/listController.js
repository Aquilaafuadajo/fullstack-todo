const {promisify} = require('util')
const jwt = require('jsonwebtoken');
const List = require('../models/listModel');
const User = require('../models/userModel')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllList = catchAsync(async (req, res, next) => { 
  const userLists = await List.find({ownerId: req.user.id})

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
  const newList = await List.create({
    name: req.body.name,
    ownerId: req.user.id
  })
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
  const list = await List.findByIdAndDelete(req.params.id)

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

exports.protect = catchAsync( async (req, res, next) => {
  // 1. Getting token and checking if it exists
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

    token = req.headers.authorization.split(' ')[1]
  }
  if(!token) {
    return next(new AppError('You are not logged in! Please log in to get access', 401))
  }
  // 2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  console.log(decoded)

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id)
  if(!currentUser) {
    return next(new AppError('This user belonging to this token no longer exist.', 401))
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next()
})
