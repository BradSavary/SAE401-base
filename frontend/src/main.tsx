import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from './routes/root';
import { Welcome } from './routes/welcome';
import { Register } from './routes/register';
import { Login } from './routes/login';
import { Confirm } from './routes/confirm';

import  Feed  from './routes/feed';
import { Write } from './routes/write';
import Profile from './routes/profile';

import OtherProfile from './routes/otherProfile';

import EditProfile from './routes/editProfile';

import { Admin } from './routes/admin';
import { EditUser } from './routes/editUser';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'feed',
        element: <Feed />,
      },
      {
        path: 'write',
        element: <Write />
      },
      {
        path: 'profile',
        element: <Profile/>,
      },
      {
        path: 'profile/edit',
        element: <EditProfile />
      },
      {
        path: 'profile/:userName',
        element: <OtherProfile/>,
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
  },
  {
    path: '/confirm',
    element: <Confirm />,
  },
  {
    path: '/admin',
    element: <Admin />
  },
  {
    path: '/admin/edit/:userId',
    element: <EditUser />
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