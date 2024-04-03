import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.scss'; 
import Alert from './Alert';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ message: '', type: '', show: false }); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://journeybuddy-backend.onrender.com/login', { email, password });
      setAlert({ message: response.data.message, type: 'success', show: true });
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (error) {
      setAlert({ message: error.response.data.detail, type: 'error', show: true });
    }
  };

  const handleRegisterNavigate = () => {
    navigate('/register');
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
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
          </form>
          <button className="switch-mode" onClick={handleRegisterNavigate}>Need an account? Register</button>
        </div>
      </div>
    </>
  );
}

export default Login;
