import mongoose from 'mongoose'

// One document per named counter. Used to hand out sequential numbers, such as
// complaint ticket numbers. `_id` is the counter's name, `seq` its last value.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})

export default mongoose.model('Counter', counterSchema)