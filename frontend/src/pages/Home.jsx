import { useState } from "react";
import Events from "../components/Events";
import CreateEventForm from "../components/CreateEventForm";
import "../styles/home.css";

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Event Management</h1>
        <button className="create-event-btn" onClick={() => setShowModal(true)}>
          + Create Event
        </button>
      </header>

      <Events />

      {showModal && <CreateEventForm onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Home;
