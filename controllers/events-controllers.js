const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Event = require("../models/event");
const Organizator = require("../models/organizator");

const getEventById = async (req, res, next) => {
  const eventId = req.params.eid;

  let event;
  try {
    event = await Event.findById(eventId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a event.",
      500
    );
    return next(error);
  }

  if (!event) {
    const error = new HttpError(
      "Could not find event for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ event: event.toObject({ getters: true }) });
};

const getEventsByOrganizatorId = async (req, res, next) => {
  const organizatorId = req.params.oid;

  let organizatorWithEvents;
  try {
    organizatorWithEvents = await Organizator.findById(organizatorId).populate(
      "events"
    );
  } catch (err) {
    const error = new HttpError(
      "Fetching events failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!organizatorWithEvents || organizatorWithEvents.events.length === 0) {
    return next(
      new HttpError(
        "Could not find events for the provided organizator id.",
        404
      )
    );
  }

  res.json({
    events: organizatorWithEvents.events.map((event) =>
      event.toObject({ getters: true })
    ),
  });
};

const createEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data!.", 422)
    );
  }

  const { title, eventType, date } = req.body;

  const createdEvent = new Event({
    title,
    eventType,
    date,
    creator: req.organizatorData.organizatorId,
  });

  let organizator;
  try {
    organizator = await Organizator.findById(req.organizatorData.organizatorId);
  } catch (err) {
    const error = new HttpError(
      "Creating event failed, please try again",
      500
    );
    return next(error);
  }
  if (!organizator) {
    const error = new HttpError(
      "Could not find organizator for provided id.",
      404
    );
    return next(error);
  }

  //  console.log(organizator);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdEvent.save({ session: sess });
    organizator.events.push(createdEvent);
    console.log(req.body);
    await organizator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating event failed, please try again!",
      500
    );
    return next(error);
  }

  res.status(201).json({ event: createdEvent });

};

const updateEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data!", 422)
    );
  }

  const { title, eventType } = req.body;
  const eventId = req.params.eid;

  let event;
  try {
    event = await Event.findById(eventId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update event.",
      500
    );
    return next(error);
  }

  if (event.creator.toString() !== req.organizatorData.organizatorId) {
    const error = new HttpError("You are not allowed to edit this event.", 401);
    return next(error);
  }

  event.title = title;
  event.eventType = eventType;
  

  try {
    await event.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update event.",
      500
    );
    return next(error);
  }

  res.status(200).json({ event: event.toObject({ getters: true }) });
};

const deleteEvent = async (req, res, next) => {
  const eventId = req.params.eid;

  let event;
  try {
    event = await Event.findById(eventId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete event.",
      500
    );
    return next(error);
  }

  if (!event) {
    const error = new HttpError("Could not find event for this id.", 404);
    return next(error);
  }

  if (event.creator.id !== req.organizatorData.organizatorId) {
    const error = new HttpError(
      "You are not allowed to delete this event.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await event.remove({ session: sess });
    event.creator.events.pull(event);
    await event.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete event.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted event." });
};

exports.getEventById = getEventById;
exports.getEventsByOrganizatorId = getEventsByOrganizatorId;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
