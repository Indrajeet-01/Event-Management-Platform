import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/events.css";

// Utility function for date & time formatting
const formatDateTime = (isoString) => {
  const eventDate = new Date(isoString);

  // Format Date: "Mon 08-02-2025"
  const formattedDate = eventDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-"); 

  return { formattedDate };
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events"); // Adjust API URL
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p className="loading">Loading events...</p>;

  return (
    <div className="events-container">
      <h2>Upcoming Events</h2>
      <div className="events-grid">
        {events.length > 0 ? (
          events.map((event) => {
            const { formattedDate, formattedTime } = formatDateTime(event.date);

            return (
              <div key={event._id} className="event-card" onClick={() => navigate(`/event/${event._id}`)}>
                <h3>{event.name}</h3>
                <p><strong>Date:</strong> {formattedDate}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Attendees:</strong> {event.attendees.length}</p>
              </div>
            );
          })
        ) : (
          <p className="no-events">No events available.</p>
        )}
      </div>
    </div>
  );
};

export default Events;
