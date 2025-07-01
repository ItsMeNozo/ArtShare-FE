"use client";

import { BadgeCheck, ArrowRight, Mail } from "lucide-react";
import NumberFlow from "@number-flow/react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createCheckoutSession,
  CreateCheckoutSessionPayload,
} from "@/pages/Home/api/stripe.api";
import { useUser } from "@/contexts/UserProvider";
import { useSubscriptionInfo } from "@/hooks/useSubscription";
import { FaCheckCircle } from "react-icons/fa";
import { SubscriptionPlan } from "@/api/subscription/get-subscription-info.api";

const DEFAULT_CONTACT_EMAIL = "your-default-email@example.com";

export interface PricingTier {
  id: string;
  name: string;
  price: Record<string, number | string>;
  description: string;
  features: string[];
  cta: string;
  actionType: "checkout" | "contact" | "none";
  contactEmail?: string;
  highlighted?: boolean;
  popular?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  paymentFrequency: string;
}

const getSubscriptionPlanFromTier = (tierId: string): SubscriptionPlan => {
  switch (tierId) {
    case "individual":
      return SubscriptionPlan.FREE;
    case "artist":
      return SubscriptionPlan.ARTIST_PRO;
    case "studio":
      return SubscriptionPlan.STUDIO;
    case "enterprise":
      return SubscriptionPlan.ENTERPRISE;
    default:
      console.warn(`Unknown tier ID: ${tierId}. Defaulting to FREE plan.`);
      return SubscriptionPlan.FREE;
  }
};

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
  const price = tier.price[paymentFrequency];
  const isHighlighted = tier.highlighted;
  const isPopular = tier.popular;
  const { user } = useUser();

  const { data: subscriptionInfo } = useSubscriptionInfo();

  const handleProceedToCheckout = async () => {
    if (tier.actionType !== "checkout") return;
    const planId = tier.id + `_${paymentFrequency}`;
    if (!planId) {
      console.error(
        `Missing Price ID for CHECKOUT action. Tier: ${tier.name}, Interval: ${paymentFrequency}`,
      );
      return;
    }
    try {
      const payload: CreateCheckoutSessionPayload = {
        planId: planId,
        email: user?.email,
        userId: user?.id,
      };
      const sessionResult = await createCheckoutSession(payload);
      window.location.href = sessionResult.url;
    } catch (err) {
      console.error("Checkout session creation failed:", err);
    }
  };

  const getCtaProps = () => {
    if (
      subscriptionInfo &&
      subscriptionInfo.plan === getSubscriptionPlanFromTier(tier.id)
    ) {
      return {
        text: "Current Plan",
        action: undefined,
        icon: FaCheckCircle,
        asChild: false,
        href: undefined,
        variant: isHighlighted ? "secondary" : "outline", // Give current plan a distinct look
        disabled: true,
      };
    }
    switch (tier.actionType) {
      case "checkout":
        return {
          text: tier.cta,
          action: handleProceedToCheckout,
          icon: ArrowRight,
          asChild: false,
          href: undefined,
          variant: isHighlighted ? "secondary" : "default",
        };
      case "contact": {
        const email = tier.contactEmail || DEFAULT_CONTACT_EMAIL;
        return {
          text: tier.cta,
          action: undefined,
          icon: Mail,
          asChild: true,
          href: `mailto:${email}?subject=Inquiry about ${tier.name} Plan`,
          variant: isHighlighted ? "secondary" : "default",
        };
      }
      case "none":
      default:
        return null;
    }
  };

  const ctaProps = getCtaProps();

  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col gap-8 overflow-hidden p-6 rounded-lg border",
        isHighlighted
          ? "bg-gradient-to-b from-blue-800 to-purple-800 text-white border-purple-700 dark:border-purple-600" // Gradient works for dark, ensure border is visible
          : "bg-white dark:bg-slate-800 border-mountain-300 dark:border-slate-700 text-slate-900 dark:text-slate-50", // Default card styles
        isPopular &&
          !isHighlighted &&
          "border-2 border-indigo-600 dark:border-indigo-500", // Popular border only if not highlighted
      )}
    >
      {isHighlighted && <HighlightedBackground isDarkMode />}
      {isPopular && !isHighlighted && <PopularBackground isDarkMode />}

      {/* Tier Name and Popular Badge */}
      <h2
        className={cn(
          "flex items-center gap-3 text-xl capitalize",
          isHighlighted ? "text-white" : "text-slate-900 dark:text-slate-50",
        )}
      >
        {tier.name}
        {isPopular && (
          <Badge
            variant="secondary" // shadcn secondary usually adapts
            className={cn(
              "z-10 mt-1",
              isHighlighted
                ? "bg-white/20 text-white" // Badge on highlighted card
                : "bg-indigo-50 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-200", // Badge on default card
            )}
          >
            🔥 Most Popular
          </Badge>
        )}
      </h2>

      {/* Price Display */}
      <div
        className={cn(
          "relative h-12",
          isHighlighted ? "text-white" : "text-slate-900 dark:text-slate-100",
        )}
      >
        {typeof price === "number" ? (
          <>
            <NumberFlow
              format={{
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }}
              value={price}
              className="text-4xl" // Text color inherited from parent
            />
            <p
              className={cn(
                "-mt-2 text-xs",
                isHighlighted
                  ? "text-purple-200"
                  : "text-muted-foreground dark:text-slate-400",
              )}
            >
              Per month/user
            </p>
          </>
        ) : (
          <h1 className="text-4xl">{price}</h1> // Text color inherited
        )}
      </div>

      {/* Description and Features */}
      <div className="flex-1 space-y-2">
        <h3
          className={cn(
            "text-xs",
            isHighlighted
              ? "text-purple-100"
              : "text-slate-700 dark:text-slate-300",
          )}
        >
          {tier.description}
        </h3>
        <ul className="space-y-2">
          {tier.features.map((feature, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs",
                isHighlighted
                  ? "text-mountain-200 dark:text-purple-200"
                  : "text-muted-foreground dark:text-slate-400",
              )}
            >
              <BadgeCheck
                className={cn(
                  "flex-shrink-0 w-4 h-4",
                  isHighlighted
                    ? "text-purple-300"
                    : "text-indigo-500 dark:text-indigo-400", // Give check a distinct color
                )}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Conditional CTA Button/Link */}
      {ctaProps && (
        <Button
          variant={isHighlighted ? "secondary" : "default"}
          size="lg" // Make buttons a bit larger for pricing cards
          className={cn(
            "z-10 w-full cursor-pointer mt-auto", // Use mt-auto to push to bottom if card heights vary
            ctaProps.disabled && "opacity-70 cursor-not-allowed",
            ctaProps.disabled && isHighlighted
              ? "bg-white/30 hover:bg-white/40 text-white"
              : ctaProps.disabled && !isHighlighted
                ? "dark:bg-slate-700 dark:text-slate-400 bg-slate-200 text-slate-500"
                : "",
          )}
          onClick={ctaProps.action}
          asChild={ctaProps.asChild}
          disabled={ctaProps.disabled}
        >
          {ctaProps.asChild ? (
            <a
              href={ctaProps.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center"
            >
              {ctaProps.icon && <ctaProps.icon className="mr-2 w-4 h-4" />}
              {ctaProps.text}
            </a>
          ) : (
            <>
              {ctaProps.icon && <ctaProps.icon className="mr-2 w-4 h-4" />}
              {ctaProps.text}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

const HighlightedBackground = ({ isDarkMode }: { isDarkMode?: boolean }) => (
  <div
    className={cn(
      "absolute inset-0 bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-50 dark:opacity-30",
      isDarkMode
        ? "bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]"
        : "bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)]",
    )}
    style={{
      // Use light grid for the dark gradient background
      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)`,
    }}
  />
);

const PopularBackground = ({ isDarkMode }: { isDarkMode?: boolean }) => (
  <div
    className={cn(
      "absolute inset-0",
      "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15)_0%,rgba(255,255,255,0)_100%)]",
      isDarkMode &&
        "dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2)_0%,rgba(255,255,255,0)_100%)]", // Slightly more intense for dark
    )}
  />
);
