import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ThreadsIcon } from "../../ui/LogoIcon/threads";
import Button from "../../ui/Button/Button";
import { MetaIcon } from "../../ui/LogoIcon/Meta";
import Input from "../../ui/Input/Input";
import { ArrowIcon } from "../../ui/Icon/arrow";
import { apiRequest } from '../../lib/api-request';
import LoadingIcon from '../../ui/Loading/LoadingIcon';

export function ConfirmForm() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const tempEmail = localStorage.getItem('temporaryemail');
        if (tempEmail) {
            setEmail(tempEmail);
        }
    }, []);

    const handleConfirm = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        console.log('Email:', email);
        console.log('Code:', code);
        try {
            const response: Response = await apiRequest('/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code: parseInt(code, 10) }),
            });
            const noError = response.status === 200;

            if (noError) {
                localStorage.removeItem('temporaryemail');
                navigate('/login');
            } else {
                console.error('Invalid confirmation code');
            }
        } catch (error) {
            console.error('Error confirming email:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setIsLoading(true);
        try {
            const response: Response = await apiRequest('/resend-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const noError = response.status !== 200;

            if (noError) {
                console.log('Confirmation email resent');
            } else {
                console.error('Failed to resend confirmation email');
            }
        } catch (error) {
            console.error('Error resending confirmation email:', error);
        } finally {
            setIsLoading(false);
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
            <form onSubmit={handleConfirm} className="w-full flex flex-col justify-center space-y-4 h-full">
                <p className='text-custom pb-16 font-bold text-center text-2xl'>Please confirm your Email. Check your mailbox !</p>
                <div className='w-full flex flex-col gap-4'>
                    <h2 className="text-custom font-bold">Confirm your email</h2>
                    <div>
                        <Input
                            variant="primary"
                            placeholder="Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary" type="submit">Confirm</Button>
                    <p className='text-custom-gray self-center underline cursor-pointer' onClick={handleResendEmail}>Send another Email</p>
                </div>
            </form>
            {isLoading && <LoadingIcon className="absolute top-10" size="xlarge" alt="Loading-logo" />}
            <MetaIcon className="absolute bottom-0" size="xlarge" alt="Meta-logo" />
        </div>
    );
}