const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: { type: String, required: true },
  eventType: { type: String, required: true },
  date: { type: Date, required: false },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'Organizator' }
});

module.exports = mongoose.model('Event', eventSchema);