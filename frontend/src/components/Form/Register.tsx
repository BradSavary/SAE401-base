import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ThreadsIcon } from "../../ui/LogoIcon/threads";
import Button from "../../ui/Button/Button";
import { MetaIcon } from "../../ui/LogoIcon/Meta";
import Input from "../../ui/Input/Input";
import { ArrowIcon } from "../../ui/Icon/arrow";
import { apiRequest } from '../../lib/api-request';
import PasswordStrength from '../../ui/Password/PasswordStrength';

export function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await apiRequest('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            alert('Registration successful! Please check your email for confirmation.');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-between h-screen bg-custom p-4 py-32">
            <Link to="/welcome">
                <ArrowIcon className="absolute top-0 left-0 m-4" alt="Back-arrow" />
            </Link>
            <Link to="/welcome">
                <ThreadsIcon size="xlarge" alt="Threads-logo" />
            </Link>
            <div className="w-full flex flex-col justify-center space-y-4">
                <h2 className="text-custom font-bold">Sign Up</h2>
                <div>
                    <Input
                        variant="primary"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <Input
                        variant="primary"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <Input
                        variant="primary"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <PasswordStrength password={password} />
                <Button variant="secondary" onClick={handleRegister}>Sign up</Button>
            </div>
            <MetaIcon className="absolute bottom-0" size="xlarge" alt="Meta-logo" />
        </div>
    );
}