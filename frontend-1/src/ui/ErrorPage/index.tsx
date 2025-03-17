// filepath: /home/bradsavary/SAE401-base/frontend/src/ui/ErrorPage/index.tsx
import React from 'react';

const ErrorPage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="error-page">
      <h1>Error</h1>
      <p>{message}</p>
    </div>
  );
};

export default ErrorPage;