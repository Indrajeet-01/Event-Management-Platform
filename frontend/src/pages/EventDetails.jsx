import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/eventDetails.css"; // Import CSS

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

  // Format Time: "01:30 PM"
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { formattedDate, formattedTime };
};

const EventDetails = () => {
  const { id } = useParams(); // Get event ID from URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const [message, setMessage] = useState(""); // Success message state

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`);
      const data = await response.json();
      setEvent(data);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const userId = user?._id;

        console.log("User ID:", userId);
        console.log("Attendees:", data.attendees);

        setAttending(userId && data.attendees?.some(att => att._id === userId));
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000); // Hide after 3 seconds
  };

  const handleJoinEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to join the event.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/events/${id}/join`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Joined Event Response:", data); // DEBUG

        // Extract user from local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);

          // Update state without full re-fetch
          setEvent(prevEvent => ({
            ...prevEvent,
            attendees: [...prevEvent.attendees, { _id: user._id, name: user.name, email: user.email }]
          }));
          setAttending(true);
          showMessage("You have successfully joined the event! 🎉");
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to leave the event.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/events/${id}/leave`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        // Extract user from local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);

          // Update state without full re-fetch
          setEvent(prevEvent => ({
            ...prevEvent,
            attendees: prevEvent.attendees.filter(att => att._id !== user._id)
          }));
          setAttending(false);
          showMessage("You have left the event successfully.");
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error leaving event:", error);
    }
  };

  if (loading) return <p className="loading">Loading event details...</p>;
  if (!event) return <p className="error">Event not found.</p>;

  // Get formatted date and time
  const { formattedDate, formattedTime } = formatDateTime(event.date);

  return (
    <div className="event-details-container">
      <h2>{event.name}</h2>
      
      {/* Success Message */}
      {message && <p className="success-message">{message}</p>}

      <p><strong>Date:</strong> {formattedDate}</p>
      <p><strong>Time:</strong> {event.time}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Description:</strong> {event.description}</p>

      <h3>Attendees:</h3>
      {event.attendees && event.attendees.length > 0 ? (
        <ul>
          {event.attendees.map((attendee) => (
            <li key={attendee._id}>{attendee.name} ({attendee.email})</li>
          ))}
        </ul>
      ) : (
        <p>No attendees yet.</p>
      )}

      {/* Join or Leave Event Button */}
      {attending ? (
        <button className="leave-btn" onClick={handleLeaveEvent}>Leave Event</button>
      ) : (
        <button className="join-btn" onClick={handleJoinEvent}>Join Event</button>
      )}
    </div>
  );
};

export default EventDetails;
