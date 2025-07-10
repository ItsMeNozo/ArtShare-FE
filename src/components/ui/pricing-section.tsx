import { PricingCard, type PricingTier } from '@/components/ui/pricing-card';
import { Tab } from '@/components/ui/pricing-tab';
import * as React from 'react';

interface PricingSectionProps {
  tiers: PricingTier[];
  frequencies: string[];
}

export function PricingSection({ tiers, frequencies }: PricingSectionProps) {
  const [selectedFrequency, setSelectedFrequency] = React.useState(
    frequencies[0],
  );

  return (
    <section className="flex w-full flex-col items-center space-y-4">
      <div className="text-center">
        <div className="mx-auto flex w-fit rounded-full bg-indigo-50 p-1">
          {frequencies.map((freq) => (
            <Tab
              key={freq}
              text={freq}
              selected={selectedFrequency === freq}
              setSelected={setSelectedFrequency}
              discount={freq === 'yearly'}
            />
          ))}
        </div>
      </div>
      <div className="max-w-8xl grid w-full gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            paymentFrequency={selectedFrequency}
          />
        ))}
      </div>
    </section>
  );
}
