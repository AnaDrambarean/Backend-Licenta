const express = require("express");
const { check } = require("express-validator");

const servicesControllers = require("../controllers/services-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:sid", servicesControllers.getServiceById);

router.get("/furnizor/:fid", servicesControllers.getServicesByFurnizorId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("contact").isLength({ min: 10 }),
    check("address").not().isEmpty(),
  ],
  servicesControllers.createService
);

router.patch(
  "/:sid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  servicesControllers.updateService
);

router.delete("/:sid", servicesControllers.deleteService);

module.exports = router;
