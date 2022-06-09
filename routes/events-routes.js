const express = require("express");
const { check } = require("express-validator");

const eventsControllers = require("../controllers/events-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:eid", eventsControllers.getEventById);

router.get("/organizator/:oid", eventsControllers.getEventsByOrganizatorId);


router.use(checkAuth);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("eventType").isLength({ min: 5 }),
    check("date").not().isEmpty(),
  ],
  eventsControllers.createEvent
);

router.patch(
  "/:eid",
  [
    check("title").not().isEmpty(),
  ],
  eventsControllers.updateEvent
);

router.delete("/:eid", eventsControllers.deleteEvent);

module.exports = router;
