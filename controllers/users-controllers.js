const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const Furnizor = require("../models/furnizor");
const Organizator = require("../models/organizator");


const getFurnizori = async (req, res, next) => {
  let furnizori;
  try {
    furnizori = await Furnizor.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching furnizori failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    furnizori: furnizori.map((furnizor) =>
      furnizor.toObject({ getters: true })
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

  let existingFurnizor;
  try {
    existingFurnizor = await Furnizor.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingFurnizor) {
    const error = new HttpError(
      "Furnizor exists already, please login instead.",
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
  const createdFurnizor = new Furnizor({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    services: [],
  });

  try {
    await createdFurnizor.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { furnizorId: createdFurnizor.id, email: createdFurnizor.email },
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
    furnizorId: createdFurnizor.id,
    email: createdFurnizor.email,
    token: token,
    
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  // console.log(email);
  let existingFurnizor;
  let existingOrganizator;
existingOrganizator= await Organizator.findOne({email:email});
existingFurnizor = await Furnizor.findOne({ email: email });

if(existingOrganizator===null && existingFurnizor===null){
  const error = new HttpError(
      "Cont inexistent!",
      403
    );
    return next(error);
}
else if(existingOrganizator!==null && existingFurnizor===null){
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingOrganizator.password);
  } catch (err) {
    const error = new HttpError(
      "Nu v-am putut conecta, vă rugăm verificați credențialele introduse și încercați din nou",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }
  let tokenO;
  try {
    tokenO = jwt.sign(
      { organizatorId: existingOrganizator.id, email: existingOrganizator.email },
      "secret_nu_transmiteti",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    organizatorId: existingOrganizator.id,
    email: existingOrganizator.email,
    token: tokenO,
    role: 'organizator',
  });
}else{
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingFurnizor.password);
  } catch (err) {
    const error = new HttpError(
      "Nu v-am putut conecta, vă rugăm verificați credențialele introduse și încercați din nou",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { furnizorId: existingFurnizor.id, email: existingFurnizor.email },
      "secret_nu_transmiteti",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in up failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    furnizorId: existingFurnizor.id,
    email: existingFurnizor.email,
    token: token,
    role: 'furnizor',
  });
}

  
  // try {
  //   existingFurnizor = await Furnizor.findOne({ email: email });
  // } catch (err) {
    // const error = new HttpError(
    //   "Loggin in failed, please try again later.",
    //   500
    // );
    // return next(error);
  //   try {
  //     existingOrganizator = await Organizator.findOne({ email: email });
  //     const error = new HttpError(
  //       "eroare.",
  //       500
  //     );
  //     return next(error);
  //   } catch (err2) {
  //     const error = new HttpError(
  //       "Loggin in failed, please try again later.",
  //       500
  //     );
  //     return next(error);
  //   }
  // }

  // if (!existingFurnizor && !existingOrganizator) {
  //   const error = new HttpError(
  //     "Invalid credentials, could not log you in.",
  //     403
  //   );
  //   return next(error);
  // }

  // let isValidPassword = false;
  // try {
  //   isValidPassword = await bcrypt.compare(password, existingFurnizor.password);
  // } catch (err) {
  //   const error = new HttpError(
  //     "Nu v-am putut conecta, vă rugăm verificați credențialele introduse și încercați din nou",
  //     500
  //   );
  //   return next(error);
  // }
  // if (!isValidPassword) {
  //   const error = new HttpError(
  //     "Invalid credentials, could not log you in.",
  //     403
  //   );
  //   return next(error);
  // }
  // let token;
  // try {
  //   token = jwt.sign(
  //     { furnizorId: existingFurnizor.id, email: existingFurnizor.email },
  //     "secret_nu_transmiteti",
  //     { expiresIn: "1h" }
  //   );
  // } catch (err) {
  //   const error = new HttpError(
  //     "Logging in up failed, please try again later.",
  //     500
  //   );
  //   return next(error);
  // }

  // res.json({
  //   // furnizorId: existingFurnizor.id,
  //   email: existingOrganizator.email,
  //   // token: token,
  // });
};

exports.getFurnizori = getFurnizori;
exports.signup = signup;
exports.login = login;
