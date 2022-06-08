const express = require('express');
const { check } = require('express-validator');

const organizatoriController = require('../controllers/users-controllers');
const organizatoriController1 = require('../controllers/organizatori-controllers');


const router = express.Router();



router.post(
  '/signup',
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  organizatoriController1.signup
);

router.post('/login', organizatoriController.login);

module.exports = router;
