import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from './routes/root';
import { Feed } from './routes/feed';
import { fetchFeedPosts as FeedLoader } from './data/post';

import { Welcome } from './routes/welcome';
import { Register } from './routes/register';
import { Login } from './routes/login';

import { Write } from './routes/write';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'feed',
        element: <Feed />,
        loader: FeedLoader
      },
      {
        path: 'write',
        element: <Write />
      }
    ],
  },
  {
    path: '/welcome',
    element: <Welcome />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  }
]);

const rootElement = document.querySelector('#root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <div className='h-screen bg-custom'>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
    </div>,
  );
} else {
  console.error('No root element found');
}