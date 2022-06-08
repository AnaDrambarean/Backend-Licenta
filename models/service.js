const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  contact: {type: String, required: true, minlength: 10, maxlength:10},
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'Furnizor' }
});

module.exports = mongoose.model('Service', serviceSchema);
