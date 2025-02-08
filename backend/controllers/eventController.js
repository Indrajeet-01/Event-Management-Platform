const Event = require("../models/eventModel");
const { io } = require("../server");

// Create an Event
const createEvent = async (req, res) => {
  const { name, description, date,time, location } = req.body;

  try {
    const event = await Event.create({
      user: req.user._id,
      name,
      description,
      date,
      time,
      location,
      attendees: [],
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("user", "name email");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("attendees", "name email");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update an Event (Only Creator)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    event.name = req.body.name || event.name;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;
    event.location = req.body.location || event.location;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an Event (Only Creator)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Join an event
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prevent duplicate join
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already attending this event" });
    }

    event.attendees.push(req.user._id);
    await event.save();

    // Populate attendees before sending response
    const updatedEvent = await Event.findById(req.params.id).populate("attendees", "name email");

    res.status(200).json({ event: updatedEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

  
// Leave an Event (Remove Attendee)
const leaveEvent = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ensure user is in attendees list before removing
    if (!event.attendees.some(attendee => attendee.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "You are not an attendee of this event" });
    }

    // Remove user from attendees list
    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== req.user._id.toString()
    );

    await event.save();

    // Emit a real-time update (ensure io is defined globally in your server file)
    if (typeof io !== "undefined") {
      io.to(req.params.id).emit("attendeeUpdate", {
        message: "A user left the event",
        userId: req.user._id,
      });
    }

    // Send updated event details
    const updatedEvent = await Event.findById(req.params.id).populate("attendees", "name email");
    res.status(200).json({ event: updatedEvent });
  } catch (error) {
    console.error("Error in leaveEvent:", error);
    res.status(500).json({ message: "Server error" });
  }
};

  // Get Event Attendees
  const getEventAttendees = async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).populate(
        "attendees",
        "name email"
      );
  
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      res.json(event.attendees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent, joinEvent, leaveEvent, getEventAttendees };
