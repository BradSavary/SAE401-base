import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ThreadsIcon } from "../../ui/LogoIcon/threads";
import Button from "../../ui/Button/Button";
import { MetaIcon } from "../../ui/LogoIcon/Meta";
import Input from "../../ui/Input/Input";
import { ArrowIcon } from "../../ui/Icon/arrow";
import { apiRequest } from '../../lib/api-request';
import PasswordStrength from '../../ui/Password/PasswordStrength';
import LoadingIcon from '../../ui/Loading/LoadingIcon'; // Assurez-vous d'avoir un composant LoadingIcon

export function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // État pour le logo de chargement
    const [error, setError] = useState(''); // État pour les messages d'erreur
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true); // Afficher le logo de chargement
        setError(''); // Réinitialiser les erreurs
        try {
            const response = await apiRequest('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            }) as Response;

            if (!response.ok) {
                const errorData = await response.json();       
                if (errorData.code === 'INVALID_EMAIL') {
                    setError('Invalid email format');
                } else if (errorData.code === 'USERNAME_TAKEN') {
                    setError('Username already taken');
                } else if (errorData.code === 'EMAIL_TAKEN') {
                    setError('Email already used');
                } else {
                    setError('Registration failed. Please try again.');
                }
                setIsLoading(false); // Masquer le logo de chargement
                return;
            }

            localStorage.setItem('temporaryemail', email);
            alert('Registration successful! Please check your email for confirmation.');
            navigate('/confirm');
        } catch (error) {
            console.error('Registration error:', error);
            setError('Registration failed. Please try again.');
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
            <form onSubmit={handleRegister} className="w-full flex flex-col justify-center space-y-4">
                <h2 className="text-custom font-bold">Sign Up</h2>
                {error && <div className="text-red-500">{error}</div>}
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
                <Button variant="secondary" type="submit">Sign up</Button>
            </form>
            {isLoading && <LoadingIcon className="absolute top-10" size="xlarge" alt="Loading-logo" />}
            <MetaIcon className="absolute bottom-0" size="xlarge" alt="Meta-logo" />
        </div>
    );
}