import { PricingTier } from "@/components/ui/pricing-card";
import { PricingSection } from "@/components/ui/pricing-section";
import PlanHelpGuide from "./components/PlanHelpGuide";
import { useSubscriptionInfo } from "@/hooks/useSubscription";
import { BiError } from "react-icons/bi";

export const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

export const TIERS: PricingTier[] = [
  {
    id: "individual",
    name: "Starter",
    price: {
      monthly: "Free",
      yearly: "Free",
    },
    description: "Used by art lovers",
    features: [
      "Showcase art & build public portfolio.",
      "Connect with artists community",
      "Generate AI art with daily credits.",
      "Explore AI artworks and prompts.",
      "Get prompt ideas from popular styles.",
      "Like, comment, follow, and share art.",
    ],
    cta: "Get started",
    actionType: "none",
  },
  {
    id: "artist",
    name: "Creative Pro",
    price: {
      monthly: 12,
      yearly: 10,
    },
    description: "Great for professional content creators",
    features: [
      "Includes all Free plan features.",
      "Use advanced AI models for better art.",
      "Get a larger monthly AI quota.",
      "Generate high-res art without watermark.",
      "Gain commercial rights (T&Cs apply).",
      "Smarter, trend-based prompt suggestions.",
      "Organize art with portfolio collections.",
      "More storage for your artwork.",
    ],
    cta: "Get started",
    actionType: "checkout",
    popular: true,
  },
  {
    id: "studio",
    name: "Studios",
    price: {
      monthly: 30,
      yearly: 24,
    },
    description: "Great for small/medium businesses",
    features: [
      "Everything in Creative Pro plan.",
      "Equip your team with collaborative tools (includes multiple user seats).",
      "Access a massive, shared pool of AI generation credits for team projects.",
      "Track team usage and artwork performance with analytics.",
      "Ensure faster workflows with top priority in the AI generation queue.",
      "Secure robust commercial rights suitable for agency and studio work.",
    ],
    cta: "Get started",
    actionType: "checkout",
  },
  {
    id: "enterprise",
    name: "Masterpiece",
    price: {
      monthly: "Custom",
      yearly: "Custom",
    },
    description: "For Large art agencies & businesses",
    features: [
      "Everything in Studios plan.",
      "Receive a fully bespoke platform solution tailored to enterprise needs.",
      "Negotiate custom AI generation volumes, potentially unlimited.",
      "Secure enterprise-grade Service Level Agreements (SLAs).",
      "Discuss potential white-labeling solutions for your brand.",
      "Fund custom feature development specific to your requirements.",
    ],
    cta: "Contact Us",
    actionType: "contact",
    highlighted: true,
  },
];

const UserSubscription = () => {
  const {
    data: subscriptionInfo,
    isLoading: loadingSubscriptionInfo,
    isError: isSubscriptionError,
  } = useSubscriptionInfo();
  console.log("Subscription Info:", subscriptionInfo);
  return (
    <div className="flex flex-col p-4 pb-16 w-full h-[calc(100vh-4rem)] overflow-y-auto select-none sidebar">
      <div className="flex justify-center items-center w-full">
        <div className="relative flex flex-col items-center space-y-2 bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-3xl w-112 h-48">
          {loadingSubscriptionInfo ? (
            <div className="flex justify-center items-center w-full h-full animate-pulse">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : isSubscriptionError ? (
            <div className="flex flex-col justify-center items-center w-full h-full">
              <BiError className="size-16 text-red-800" />
              <p className="text-red-800">Error loading subscription info</p>
              <button
                className="bg-indigo-500 hover:brightness-105 mt-2 px-4 py-2 rounded-lg text-white cursor-pointer"
                onClick={() => window.location.reload()}
              >
                <span>Reload page</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <p className="font-thin">Your current plan</p>
                <h1 className="inline-block bg-clip-text bg-gradient-to-r from-blue-700 via-purple-500 to-indigo-400 font-medium text-transparent text-2xl">
                  {subscriptionInfo?.plan === "free" ? "Starter" : subscriptionInfo?.plan}
                </h1>
              </div>
              <p className="font-thin text-sm">
                {subscriptionInfo?.plan === "free"
                  ? "Free to use"
                  : subscriptionInfo?.expiresAt.toLocaleDateString()}
              </p>
              <div className="bottom-4 absolute flex flex-col justify-center items-center bg-white shadow-md p-2 rounded-lg w-64 h-16 cursor-pointer">
                <p className="text-mountain-400 text-sm">Your Token Remaining</p>
                <span className="font-medium text-lg">{subscriptionInfo?.aiCreditRemaining}</span>
              </div>
            </>
          )}
        </div>

      </div>
      <hr className="flex my-8 border-[1px] border-mountain-100 w-full" />
      <PricingSection frequencies={PAYMENT_FREQUENCIES} tiers={TIERS} />
      <hr className="flex my-8 border-[1px] border-mountain-100 w-full" />
      <PlanHelpGuide />
    </div >
  )
}

export default UserSubscription