const express = require('express');
const cors = require('cors')
//const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const userRouter = require('./routes/userRoutes');
const listRouter = require('./routes/listRoutes');

const app = express()
app.use(cors())
app.options('*', cors())

app.get('/', (req, res) => {
  res.end('Connected to the hosted server')
})

app.use(express.json());

//app.use(compression())

app.use('/api/v1/users', userRouter) 
app.use('/api/v1/lists', listRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)

module.exports = app