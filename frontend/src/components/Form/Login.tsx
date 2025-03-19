import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ThreadsIcon } from "../../ui/LogoIcon/threads";
import Button from "../../ui/Button/Button";
import { MetaIcon } from "../../ui/LogoIcon/Meta";
import Input from "../../ui/Input/Input";
import { ArrowIcon } from "../../ui/Icon/arrow";
import { apiRequest } from '../../lib/api-request';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await apiRequest<{ token: string }>('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            localStorage.setItem('accessToken', response.token);
            alert('Login successful!');
            navigate('/feed'); // Redirigez vers la page de tableau de bord ou une autre page après la connexion
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
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
                <h2 className="text-custom font-bold">Log in</h2>
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
                <Button variant="secondary" onClick={handleLogin}>Log in</Button>
                <p className="text-custom-gray underline self-center">Forgotten Password ?</p>
            </div>
            <MetaIcon className="absolute bottom-0" size="xlarge" alt="Meta-logo" />
        </div>
    );
}