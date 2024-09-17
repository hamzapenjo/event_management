const {
  updateUserStatusInModel,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserInModel,
  createUserInModel,
} = require("../models/User");

const { getEventsByCategory } = require('../models/Event');

const {
  getTotalUsers,
  getTotalOrganizers,
  getTotalEvents,
  getTotalRegistrations,
  getRecentUsers,
  getTotalAdmins,
} = require("../models/Statistics");

const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render("admin/users", { users });
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).send("Error fetching users");
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, block_until } = req.body;

  try {
    const updatedUser = await updateUserStatusInModel(id, status, block_until);
    if (!updatedUser) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }
    res
      .status(200)
      .json({ message: "Status ažuriran", status: updatedUser.status });
  } catch (error) {
    console.error("Greška pri ažuriranju statusa korisnika", error);
    res
      .status(500)
      .json({ message: "Greška pri ažuriranju statusa korisnika." });
  }
};

const getDashboardData = async (req, res) => {
    try {
        const totalUsers = await getTotalUsers();
        const totalOrganizers = await getTotalOrganizers();
        const totalAdmins = await getTotalAdmins();
        const totalEvents = await getTotalEvents();
        const totalRegistrations = await getTotalRegistrations();
        const recentUsers = await getRecentUsers();
        const eventsByCategory = await getEventsByCategory(); 

        res.render('admin/dashboard', {
            totalUsers,
            totalOrganizers,
            totalAdmins,
            totalEvents,
            totalRegistrations,
            recentUsers,
            eventsByCategory
        });
    } catch (error) {
        console.error('Error fetching dashboard data', error);
        res.status(500).send('Error fetching dashboard data');
    }
};


const getUserDetails = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await getUserById(userId);
    res.render("admin/edit-user", { user });
  } catch (error) {
    res.status(500).send("Error retrieving user details");
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await deleteUserById(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

const updateUserDetails = async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, status, block_until } = req.body;

  try {
    const updatedUser = await updateUserInModel(
      userId,
      first_name,
      last_name,
      email,
      status,
      block_until
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

const createUser = async (req, res) => {
  const { first_name, last_name, email, password, role, status } = req.body;

  try {
    const newUser = await createUserInModel(
      first_name,
      last_name,
      email,
      password,
      role,
      status
    );
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  getDashboardData,
  getUserDetails,
  deleteUser,
  updateUserDetails,
  createUser,
};
