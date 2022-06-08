const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const Organizator = require("../models/organizator");

const getOrganizatori = async (req, res, next) => {
  let organizatori;
  try {
    organizatori = await Organizator.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching organizatori failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
   organizatori: organizatori.map((organizator) =>
      organizator.toObject({ getters: true })
    ),
  });
};


const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

  let existingOrganizator;
  try {
    existingOrganizator = await Organizator.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingOrganizator) {
    const error = new HttpError(
      "Organizator exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Nu s-a putut crea contul, vă rugăm reîncercați",
      500
    );
    return next(error);
  }
  const createdOrganizator = new Organizator({
    name,
    email,
    // image: req.file.path,
    password: hashedPassword,
    events: [],
  });

  try {
    await createdOrganizator.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  let tokenO;
  try {
    tokenO = jwt.sign(
      { organizatorId: createdOrganizator.id, email: createdOrganizator.email },
      "secret_nu_transmiteti",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    organizatorId: createdOrganizator.id,
    email: createdOrganizator.email,
    token: tokenO,
  });
};
// const login = async (req, res, next) => {
//     const { email, password } = req.body;
  
//     let existingOrganizator;
  
//     try {
//       existingOrganizator = await Organizator.findOne({ email: email });
//     } catch (err) {
//       const error = new HttpError(
//         "Loggin in failed, please try again later.",
//         500
//       );
//       return next(error);
//     }
  
//     if (!existingOrganizator) {
//       const error = new HttpError(
//         "Invalid credentials, could not log you in.",
//         403
//       );
//       return next(error);
//     }
// }
  //   let isValidPassword = false;
  //   try {
  //     isValidPassword = await bcrypt.compare(password, existingOrganizator.password);
  //   } catch (err) {
  //     const error = new HttpError(
  //       "Nu v-am putut conecta, vă rugăm verificați credențialele introduse și încercați din nou",
  //       500
  //     );
  //     return next(error);
  //   }
  //   if (!isValidPassword) {
  //     const error = new HttpError(
  //       "Invalid credentials, could not log you in.",
  //       403
  //     );
  //     return next(error);
  //   }
  //   let token;
  //   try {
  //     token = jwt.sign(
  //       { organizatorId: existingOrganizator.id, email: existingOrganizator.email },
  //       "secret_nu_transmiteti",
  //       { expiresIn: "1h" }
  //     );
  //   } catch (err) {
  //     const error = new HttpError(
  //       "Logging in up failed, please try again later.",
  //       500
  //     );
  //     return next(error);
  //   }
  
  //   res.json({
  //     organizatorId: existingOrganizator.id,
  //     email: existingOrganizator.email,
  //     token: token,
  //   });
  // };
  
 
  exports.signup = signup;
  exports.getOrganizatori = getOrganizatori;
  // exports.login = login;
  
