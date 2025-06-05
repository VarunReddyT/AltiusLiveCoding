import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            username: username,
            password: password,
        };

        try {
            const response = await axios.post('http://localhost:5000/login', userData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            localStorage.setItem('access_token', response.data.access_token);
            setMessage('Login successful');
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error || 'Login failed');
            } else {
                setMessage('Error logging in');
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="exampleInputEmail1"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="exampleInputPassword1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
            <p>{message}</p>
        </div>
    );
}
