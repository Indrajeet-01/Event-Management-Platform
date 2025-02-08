const express = require("express");
const router = express.Router();
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, joinEvent, leaveEvent, getEventAttendees } = require("../controllers/eventController.js");
const protect = require("../middleware/authMiddleware.js");

// CRUD Routes for Events
router.post("/", protect, createEvent);
router.get("/", getEvents);
router.get("/:id", getEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
router.put("/:id/join", protect, joinEvent);  // Join an event
router.put("/:id/leave", protect, leaveEvent); // Leave an event
router.get("/:id/attendees", protect, getEventAttendees); // Get attendees

module.exports = router; // ✅ Ensure you're exporting the Router
