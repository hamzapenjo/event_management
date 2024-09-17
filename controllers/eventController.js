const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByInterests,
} = require("../models/Event");
const { getAllLocations } = require("../models/Location");
const { getUsersByRole } = require("../models/User");
const { getAllOrganizers } = require("../models/User");

const createNewEvent = async (req, res) => {
  const {
    name,
    description,
    date,
    time,
    category,
    ticket_price,
    organizer_id,
    location_id,
  } = req.body;
  try {
    const event = await createEvent(
      name,
      description,
      date,
      time,
      category,
      ticket_price,
      organizer_id,
      location_id
    );
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Greška pri kreiranju događaja.", error });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await getEvents();
    res.render("admin/events", { events });
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju događaja.", error });
  }
};

const getEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await getEventById(id);
    const locations = await getAllLocations();

    if (!event) {
      return res.status(404).json({ message: "Događaj nije pronađen." });
    }

    res.render("admin/edit-event", { event, locations });
  } catch (error) {
    console.error("Greška pri dohvaćanju događaja:", error);
    res.status(500).json({ message: "Greška pri dohvaćanju događaja.", error });
  }
};

const updateExistingEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, date, time, category, ticket_price, location_id } =
    req.body;

  try {
    const updatedEvent = await updateEvent(
      id,
      name,
      description,
      date,
      time,
      category,
      ticket_price,
      location_id
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Događaj nije pronađen." });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Greška pri ažuriranju događaja:", error);
    res.status(500).json({ message: "Greška pri ažuriranju događaja.", error });
  }
};

const deleteExistingEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = await deleteEvent(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Događaj nije pronađen." });
    }
    res.status(200).json({ message: "Događaj je obrisan." });
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju događaja.", error });
  }
};

const getCreateEventPage = async (req, res) => {
  try {
    const organizers = await getAllOrganizers();
    const locations = await getAllLocations();
    res.render("admin/create-event", { organizers, locations });
  } catch (error) {
    console.error(
      "Greška pri dohvaćanju podataka za kreiranje događaja:",
      error
    );
    res
      .status(500)
      .json({
        message: "Greška pri dohvaćanju podataka za kreiranje događaja.",
        error,
      });
  }
};

module.exports = {
  createNewEvent,
  getAllEvents,
  getEvent,
  updateExistingEvent,
  deleteExistingEvent,
  getCreateEventPage,
};
