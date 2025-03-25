import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from '../lib/api-request';
import Button from "../ui/Button/Button";
import TextArea from "../ui/TextArea/TextArea";
import { CloseIcon } from "../ui/Icon/close";

export function Write() {
    const [content, setContent] = useState('');
    const [charCount, setCharCount] = useState(0);
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const user_id = localStorage.getItem('user_id');

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newContent = e.target.value;
        if (newContent.length <= 280) {
            setContent(newContent);
            setCharCount(newContent.length);
        }
    };

    const handlePublish = async () => {
        try {
            const userId = user_id ? parseInt(user_id, 10) : null; // Parse user_id as an integer if it's not null
            console.log('Publishing post with content:', content, 'and user_id:', userId); // Log the data being sent
            const response = await apiRequest('/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content, user_id: userId }),
            });
            if (!response.ok) {
                alert('Failed to publish post. Please try again.');
            } else {
                alert('Post published successfully!');
                navigate('/feed');
            }
        } catch (error) {
            alert('Failed to publish post. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center h-screen bg-custom p-4 gap-8">
            <div className="w-full flex flex-row gap-4">
            <Link to="/feed">
            <CloseIcon size="xsmall" alt="Close-thread" className="absolute top-0 left-0 m-5" />
            </Link>
            <p className='text-custom pl-8 pt-0.5'>New Thread</p>
            </div>
            <div className="w-full flex flex-col justify-center space-y-4">
                <h2 className="text-custom font-bold">{username}</h2>
                <div>
                    <TextArea
                        className={`{${charCount === 280 ? 'text-red-500' : 'text-custom'}}`}
                        variant="primary"
                        placeholder="Start a thread"
                        value={content}
                        onChange={handleContentChange}
                    />
                </div>
                <div className="flex gap-4 justify-center items-center absolute bottom-0 right-0 mr-6 mb-22">
                <div className={` ${charCount === 280 ? 'text-red-500' : 'text-gray-500'}`}>{charCount}/280</div>
                <Button variant="tertiary" onClick={handlePublish}>Publier</Button>
                </div>
            </div>
        </div>
    );
}