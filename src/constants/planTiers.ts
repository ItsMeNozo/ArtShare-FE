import { PricingTier } from '@/components/ui/pricing-card';

export const PAYMENT_FREQUENCIES = ['monthly', 'yearly'];

export const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Starter',
    price: {
      monthly: 'Free',
      yearly: 'Free',
    },
    description: 'Used by art lovers',
    features: [
      'Showcase art & build public portfolio.',
      'Connect with artists community',
      'Generate AI art with daily credits.',
      'Explore AI artworks and prompts.',
      'Get prompt ideas from popular styles.',
      'Like, comment, follow, and share art.',
    ],
    cta: 'Get started',
    actionType: 'none',
  },
  {
    id: 'artist_pro',
    name: 'Creative Pro',
    price: {
      monthly: 12,
      yearly: 10,
    },
    description: 'Great for professional content creators',
    features: [
      'Includes all Free plan features.',
      '1500 tokens refresh per month.',
      'Use advanced AI models for better and higher quality generated images.',
      'Get a larger monthly AI quota.',
      'Generate high-res art without watermark.',
      'Gain commercial rights (T&Cs apply).',
      'Smarter, trend-based prompt suggestions.',
      'Organize art with portfolio collections.',
      'More storage for your artwork.',
    ],
    cta: 'Get started',
    actionType: 'checkout',
    popular: true,
  },
  {
    id: 'studio',
    name: 'Studios',
    price: {
      monthly: 30,
      yearly: 24,
    },
    description: 'Great for small/medium businesses',
    features: [
      'Everything in Creative Pro plan.',
      '4500 tokens refresh per month for team-based AI generation.',
      'Equip your team with collaborative tools (includes multiple user seats).',
      'Access a massive, shared pool of AI generation credits for team projects.',
      'Track team usage and artwork performance with analytics.',
      'Ensure faster workflows with top priority in the AI generation queue.',
      'Secure robust commercial rights suitable for agency and studio work.',
    ],
    cta: 'Get started',
    actionType: 'checkout',
  },
  {
    id: 'enterprise',
    name: 'Masterpiece',
    price: {
      monthly: 'Custom',
      yearly: 'Custom',
    },
    description: 'For Large art agencies & businesses',
    features: [
      'Everything in Studios plan.',
      'Receive a fully bespoke platform solution tailored to enterprise needs.',
      'Negotiate custom AI generation volumes, potentially unlimited.',
      'Secure enterprise-grade Service Level Agreements (SLAs).',
      'Discuss potential white-labeling solutions for your brand.',
      'Fund custom feature development specific to your requirements.',
    ],
    cta: 'Contact Us',
    actionType: 'contact',
    highlighted: true,
  },
];
