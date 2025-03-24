import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ThreadsIcon } from "../../ui/LogoIcon/threads";
import Button from "../../ui/Button/Button";
import { MetaIcon } from "../../ui/LogoIcon/Meta";
import Input from "../../ui/Input/Input";
import { ArrowIcon } from "../../ui/Icon/arrow";
import { apiRequest } from '../../lib/api-request';
import LoadingIcon from '../../ui/Loading/LoadingIcon'; // Assurez-vous d'avoir un composant LoadingIcon

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // État pour le logo de chargement
    const [error, setError] = useState(''); // État pour les messages d'erreur
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true); // Afficher le logo de chargement
        setError(''); // Réinitialiser les erreurs
        try {
            const response = await apiRequest('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            }) as Response;

            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    errorData = { message: await response.text() };
                }
                console.log('Login error:', errorData);
                if (response.status === 401) {
                    setError('Email or password incorrect');
                } else if (response.status === 403) {
                    setError('Email not verified. Please check your email for the confirmation link or ');
                } else {
                    setError('Login failed. Please try again.');
                }
                setIsLoading(false); // Masquer le logo de chargement
                return;
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.api_token);
            localStorage.setItem('user', JSON.stringify({
                api_token: data.api_token,
                email: data.email,
                username: data.username,
                user_id: data.user_id,
            }));
            alert('Login successful!');
            navigate('/feed'); // Redirect to the dashboard or another page after login
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false); // Masquer le logo de chargement
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
            <form onSubmit={handleLogin} className="w-full flex flex-col justify-center space-y-4">
                <h2 className="text-custom font-bold">Log in</h2>
                {error && (
                    <div className="text-red-500">
                        {error}
                        {error.includes('Email not verified') && (
                            <Link to="/confirm" className="text-blue-500 underline">
                                click here to confirm your email
                            </Link>
                        )}
                    </div>
                )}
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
                <Button variant="secondary" type="submit">Log in</Button>
                <p className="text-custom-gray underline self-center">Forgotten Password ?</p>
            </form>
            {isLoading && <LoadingIcon className="absolute top-10" size="xlarge" alt="Loading-logo" />}
            <MetaIcon className="absolute bottom-0" size="xlarge" alt="Meta-logo" />
        </div>
    );
}