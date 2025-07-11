import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { ChevronDown } from 'lucide-react';

const PlanHelpGuide = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center space-y-4 px-4">
      <h2 className="mb-2 text-center text-xl font-medium">
        Need help with your subscription?
      </h2>
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Typography className="text-lg font-normal text-indigo-800">
            1. What plan should I choose?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            If you're just exploring, start with the <strong>Starter</strong>{' '}
            plan. Creators should consider <strong>Creative Pro</strong> for
            better features, and teams may benefit from <strong>Studios</strong>{' '}
            or <strong>Masterpiece</strong>.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Typography className="text-lg font-normal text-indigo-800">
            2. Can I switch between monthly and yearly billing?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Yes, you can toggle between monthly and yearly plans in the pricing
            section above. Yearly plans offer a discount.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Typography className="text-lg font-normal text-indigo-800">
            3. How can I cancel or change my subscription?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Go to your profile settings, then choose <em>Subscription</em> to
            manage or cancel your plan. For enterprise users, please contact us.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Typography className="text-lg font-normal text-indigo-800">
            4. What are AI tokens?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Tokens are used to generate AI artworks. Each plan provides a
            different number of tokens per month. You can see your remaining
            tokens above.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Typography className="text-lg font-normal text-indigo-800">
            5. Still need help?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Contact our support team through the “Help” section or send an email
            to{' '}
            <a
              href="mailto:support@yourapp.com"
              className="text-blue-500 underline"
            >
              support@yourapp.com
            </a>
            .
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default PlanHelpGuide;
