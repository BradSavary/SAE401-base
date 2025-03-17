// filepath: /home/bradsavary/SAE401-base/frontend/src/ui/NavBar/index.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/buy">Buy</Link>
        </li>
        <li>
          <Link to="/team/development">Development Team</Link>
        </li>
        <li>
          <Link to="/team/sales">Sales Team</Link>
        </li>
        <li>
          <Link to="/team/webdesign">Web Design Team</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;