const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const furnizorSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, required: true },
    services: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Service" },
    ],
  },
  { timestamps: true }
);

furnizorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Furnizor", furnizorSchema);
