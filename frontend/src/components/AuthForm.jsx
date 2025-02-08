import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import "../styles/authForm.css"; // Import CSS file

const AuthForm = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      register(formData.name, formData.email, formData.password);
    } else {
      login(formData.email, formData.password);
    }
    
    navigate("/home");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit">{isRegistering ? "Register" : "Login"}</button>
        </form>
        <p>
          {isRegistering ? "Already have an account?" : "New user?"}{" "}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
