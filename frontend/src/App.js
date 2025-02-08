import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import { AuthProvider } from "./context/AuthContext"; 
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";

function App() {
  return (
    <AuthProvider> 
      <Router>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
