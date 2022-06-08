const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { stringify } = require("uuid");

const Schema = mongoose.Schema;

const organizatorSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

organizatorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Organizator", organizatorSchema);
