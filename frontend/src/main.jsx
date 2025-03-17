import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from './routes/root.jsx';
import About from './routes/about.jsx';
import Buy, {loader as storeLoader} from './routes/buy.jsx';
// import AllTeam, {loaderDevelopment as teamloaderDevelopment, loaderSales as teamloaderSales, loaderWebdesign as teamloaderWebdesign} from './routes/team.jsx';
import AllTeam, {loader as teamLoader} from './routes/team.jsx';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'buy',
        element: <Buy />,
        loader:storeLoader
      },
      { 
        path: 'about',
        element: <About />
      },
      {
        path: 'team/:teamType',
        element: <AllTeam />,
        loader: teamLoader
      }
    ],
    
  },

]);

const rootElement = document.querySelector('#root');

if (rootElement) {
  ReactDOM.createRoot(document.querySelector('#root')).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
} else {
  console.error('No root element found');
}