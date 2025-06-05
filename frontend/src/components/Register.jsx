import React, { useState } from 'react';
import axios from 'axios';

export default function Register() {
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
            const response = await axios.post('http://localhost:5000/register', userData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setMessage(response.data.message || 'Registration successful');
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error || 'Registration failed');
            } else {
                setMessage('Error registering');
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
