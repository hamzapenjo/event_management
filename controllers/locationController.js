const {
  getLocationsFromDb,
  createLocationInDb,
  getLocationByIdFromDb,
  updateLocationInDb,
  deleteLocationInDb,
} = require("../models/Location");

const getAllLocations = async (req, res) => {
  try {
    const locations = await getLocationsFromDb();
    res.render("admin/locations", { locations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations", error });
  }
};

const createLocation = async (req, res) => {
  const { name, address, city, country } = req.body;
  try {
    await createLocationInDb(name, address, city, country);
    res.status(201).json({ message: "Location created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating location", error });
  }
};

const getLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await getLocationByIdFromDb(id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.render("admin/edit-location", { location });
  } catch (error) {
    res.status(500).json({ message: "Error fetching location", error });
  }
};

const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { name, address, city, country } = req.body;
  try {
    await updateLocationInDb(id, name, address, city, country);
    res.status(200).json({ message: "Location updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating location", error });
  }
};

const deleteLocation = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteLocationInDb(id);
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting location", error });
  }
};

module.exports = {
  getAllLocations,
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
};
