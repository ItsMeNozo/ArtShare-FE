import { Container, Paper, Typography } from '@mui/material';
import React, { useEffect } from 'react';

const STRIPE_PRICING_TABLE_ID = 'prctbl_1RJp0uQfqPbYQ9hYL22Wk88G';
const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51RIgmyQfqPbYQ9hYK5N4u4o6zElDPwRMQv2NkcsPtFvCF8cPuzkbiJokvTcoxHaaImQzFpLaovmYgtUKs34lZZdK0095mM8Ykr';

const SubscribePage: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://js.stripe.com/v3/pricing-table.js"]',
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Select the billing cycle that works best for you. Yearly plans offer
          significant savings!
        </Typography>

        {/* --- Embed the Stripe Pricing Table --- */}
        {/* Ensure keys match exactly */}
        <stripe-pricing-table
          pricing-table-id={STRIPE_PRICING_TABLE_ID}
          publishable-key={STRIPE_PUBLISHABLE_KEY}
        ></stripe-pricing-table>
        {/* --- End Embed --- */}

        <Typography
          variant="caption"
          display="block"
          align="center"
          sx={{ mt: 3 }}
        >
          You will be redirected to Stripe's secure checkout to complete your
          purchase after selecting a plan.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SubscribePage;
