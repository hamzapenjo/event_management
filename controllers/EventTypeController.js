const {
  getAllEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
  deleteEventType,
} = require("../models/EventType");

const getAllEventTypesController = async (req, res) => {
  try {
    const eventTypes = await getAllEventTypes();
    res.render("admin/event-types", { eventTypes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška pri dohvaćanju tipova događaja.", error });
  }
};

const getCreateEventTypePage = async (req, res) => {
  res.render("admin/create-event-type");
};

const createNewEventType = async (req, res) => {
  const { name, description } = req.body;
  try {
    const eventType = await createEventType(name, description);
    res.status(201).json(eventType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška pri kreiranju tipa događaja.", error });
  }
};

const getEditEventTypePage = async (req, res) => {
  const { id } = req.params;
  try {
    const eventType = await getEventTypeById(id);
    if (!eventType) {
      return res.status(404).json({ message: "Tip događaja nije pronađen." });
    }
    res.render("admin/edit-event-type", { eventType });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška pri dohvaćanju tipa događaja.", error });
  }
};

const updateExistingEventType = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const updatedEventType = await updateEventType(id, name, description);
    res.status(200).json(updatedEventType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška pri ažuriranju tipa događaja.", error });
  }
};

const deleteExistingEventType = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEventType = await deleteEventType(id);
    res.status(200).json({ message: "Tip događaja je obrisan." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška pri brisanju tipa događaja.", error });
  }
};

module.exports = {
  getAllEventTypesController,
  getCreateEventTypePage,
  createNewEventType,
  getEditEventTypePage,
  updateExistingEventType,
  deleteExistingEventType,
};
