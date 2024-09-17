const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  createUser,
  getUserByEmail,
  updateUserInterestsInModel,
} = require("../models/User");

const registerUser = async (req, res) => {
  const { first_name, last_name, email, password, role, interests } = req.body;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(400).send("Korisnik s ovim emailom već postoji.");
  }

  const newUser = await createUser(
    first_name,
    last_name,
    email,
    password,
    role || "user",
    interests || []
  );
  res
    .status(201)
    .send(`Korisnik ${newUser.first_name} je uspješno registrovan.`);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ message: "Pogrešan email ili lozinka." });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Pogrešan email ili lozinka." });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      interests: user.interests,
      role: user.role,
    },
    "secret",
    { expiresIn: "1h" }
  );

  console.log("Generisani token:", token);
  console.log("Rola:", user.role);
  res.cookie("token", token, { httpOnly: true });

  res.status(200).json({ token, role: user.role });
};

const updateUserInterests = async (req, res) => {
  const { user_id } = req.params;
  const { interests } = req.body;

  if (!interests || !Array.isArray(interests)) {
    return res.status(400).json({ message: "Interesi moraju biti niz." });
  }

  try {
    const updatedUser = await updateUserInterestsInModel(user_id, interests);
    if (!updatedUser) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Greška pri ažuriranju interesa.", error });
  }
};

module.exports = { registerUser, loginUser, updateUserInterests };
