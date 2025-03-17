// filepath: /home/bradsavary/SAE401-base/frontend/src/ui/Pricing/index.tsx
import React from 'react';
import Plan from './Plan';

const pricingData = [
  // Example pricing data, replace with actual data or import from JSON
  { id: 1, title: 'Basic Plan', price: '$10/month', features: ['Feature 1', 'Feature 2'] },
  { id: 2, title: 'Pro Plan', price: '$20/month', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
  { id: 3, title: 'Enterprise Plan', price: '$30/month', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'] },
];

export default function Pricing() {
  return (
    <section className="pricing-section">
      <h1 className="text-4xl font-bold text-center">Pricing Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pricingData.map(plan => (
          <Plan key={plan.id} title={plan.title} price={plan.price} features={plan.features} />
        ))}
      </div>
    </section>
  );
}