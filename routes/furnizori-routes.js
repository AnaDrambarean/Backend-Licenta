const express = require('express');
const { check } = require('express-validator');

const furnizoriController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', furnizoriController.getFurnizori);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  furnizoriController.signup
);

router.post('/login', furnizoriController.login);


module.exports = router;
