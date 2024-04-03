import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.scss';
import Alert from './Alert';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ message: '', type: '', show: false }); // State to control Alert

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://journeybuddy-backend.onrender.com/register', { email, password });
      setAlert({ message: response.data.message, type: 'success', show: true });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      const errorMessage = error.response && error.response.data.detail ? error.response.data.detail : 'An error occurred';
      setAlert({ message: errorMessage, type: 'error', show: true });
    }
  };

  return (
    <>
      {alert.show && <Alert message={alert.message} type={alert.type} show={alert.show} setShow={(show) => setAlert({ ...alert, show })} />}
      <div className="background-container" style={{ 
        height: '100vh', 
        width: '100vw', 
        backgroundImage: 'url("/6764646_3439481.jpeg")', 
        backgroundPosition: 'center', 
        backgroundSize: 'cover', 
        backgroundRepeat: 'no-repeat' 
      }}>
        <div className="form-container">
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Register</button>
          </form>
          <button className="switch-mode" onClick={() => navigate('/login')}>Already have an account? Login</button>
        </div>
      </div>
    </>
  );
}

export default Register;
