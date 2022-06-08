const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Service = require("../models/service");
const Furnizor = require("../models/furnizor");

const getServiceById = async (req, res, next) => {
  const serviceId = req.params.sid;

  let service;
  try {
    service = await Service.findById(serviceId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a service.",
      500
    );
    return next(error);
  }

  if (!service) {
    const error = new HttpError(
      "Could not find service for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ service: service.toObject({ getters: true }) });
};

const getServicesByFurnizorId = async (req, res, next) => {
  const furnizorId = req.params.fid;


  let furnizorWithServices;
  try {
    furnizorWithServices = await Furnizor.findById(furnizorId).populate(
      "services"
    );
  } catch (err) {
    const error = new HttpError(
      "Fetching services failed, please try again later.",
      500
    );
    return next(error);
  }

  
  if (!furnizorWithServices || furnizorWithServices.services.length === 0) {
    return next(
      new HttpError(
        "Could not find services for the provided furnizor id.",
        404
      )
    );
  }

  res.json({
    services: furnizorWithServices.services.map((service) =>
      service.toObject({ getters: true })
    ),
  });
};

const createService = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, contact } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdService = new Service({
    title,
    description,
    address,
    contact,
    location: coordinates,
    image: req.file.path,
    creator: req.furnizorData.furnizorId
  });


  let furnizor;
  try {
    furnizor = await Furnizor.findById(req.furnizorData.furnizorId);
  } catch (err) {
    const error = new HttpError(
      'Creating service failed, please try again.',
      500
    );
    return next(error);
  }
  if (!furnizor) {
    const error = new HttpError(
      "Could not find furnizor for provided id.",
      404
    );
    return next(error);
  }

  // console.log(furnizor);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdService.save({ session: sess });
    furnizor.services.push(createdService);
    await furnizor.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating service failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ service: createdService });
};

const updateService = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data!.", 422)
    );
  }

  const { title, description } = req.body;
  const serviceId = req.params.sid;

  let service;
  try {
    service = await Service.findById(serviceId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update service.",
      500
    );
    return next(error);
  }

  if (service.creator.toString() !== req.furnizorData.furnizorId) {
    const error = new HttpError(
      "You are not allowed to edit this service.",
      401
    );
    return next(error);
  }

  service.title = title;
  service.description = description;

  try {
    await service.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update service.",
      500
    );
    return next(error);
  }

  res.status(200).json({ service: service.toObject({ getters: true }) });
};

const deleteService = async (req, res, next) => {
  const serviceId = req.params.sid;

  let service;
  try {
    service = await Service.findById(serviceId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete service.",
      500
    );
    return next(error);
  }

  if (!service) {
    const error = new HttpError("Could not find service for this id.", 404);
    return next(error);
  }

  if (service.creator.id !== req.furnizorData.furnizorId) {
    const error = new HttpError(
      "You are not allowed to delete this service.",
      401
    );
    return next(error);
  }

  const imagePath = service.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await service.remove({ session: sess });
    service.creator.services.pull(service);
    await service.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete service.",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted service." });
};

exports.getServiceById = getServiceById;
exports.getServicesByFurnizorId = getServicesByFurnizorId;
exports.createService = createService;
exports.updateService = updateService;
exports.deleteService = deleteService;
