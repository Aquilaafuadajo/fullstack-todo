const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: false
  }
})

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A list must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A list name must have less or equal than 40 characters'],
    minlength: [10, 'A list name must have more or equal than 40 characters']
  },
  tasks: [taskSchema],
  ownerId: {
    type: String,
    required: true
  }
})

const List = mongoose.model('Lists', listSchema)

module.exports = List;