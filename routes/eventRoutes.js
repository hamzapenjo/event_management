const express = require('express');
const { getAllEvents, createNewEvent, getCreateEventPage, getEvent, updateExistingEvent, deleteExistingEvent } = require('../controllers/eventController');
const { getUserFromToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/events', getUserFromToken, getAllEvents);

router.get('/events/create', getUserFromToken, getCreateEventPage);

router.post('/events', getUserFromToken, createNewEvent);

router.get('/events/:id/edit', getUserFromToken, getEvent);

router.put('/events/:id/edit', getUserFromToken, updateExistingEvent);

router.delete('/events/:id', getUserFromToken, deleteExistingEvent);

module.exports = router;
