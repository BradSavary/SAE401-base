// filepath: /home/bradsavary/SAE401-base/frontend/src/ui/Pricing/Plan.tsx
import React from 'react';

interface PlanProps {
  title: string;
  price: string;
  features: string[];
}

const Plan: React.FC<PlanProps> = ({ title, price, features }) => {
  return (
    <div className="plan">
      <h3>{title}</h3>
      <p>{price}</p>
      <ul>
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
};

export default Plan;