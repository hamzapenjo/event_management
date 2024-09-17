const {
  registerForEvent,
  getRegistrationsForEvent,
  updateRegistrationStatus,
} = require("../models/Registration");
const createRegistration = async (req, res) => {
  const { user_id, event_id } = req.body;
  const registration = await registerForEvent(user_id, event_id);
  res.status(201).json(registration);
};

const getEventRegistrations = async (req, res) => {
  const { event_id } = req.params;
  const registrations = await getRegistrationsForEvent(event_id);
  res.status(200).json(registrations);
};

const updateRegistration = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "approved" && status !== "rejected") {
    return res
      .status(400)
      .json({
        message:
          "Neispravan status. Dozvoljeni statusi su: approved, rejected.",
      });
  }

  const updatedRegistration = await updateRegistrationStatus(id, status);
  if (!updatedRegistration) {
    return res.status(404).json({ message: "Prijava nije pronađena." });
  }

  res.status(200).json(updatedRegistration);
};

module.exports = {
  createRegistration,
  getEventRegistrations,
  updateRegistration,
};
