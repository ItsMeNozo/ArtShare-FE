//Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PricingSection } from "@/components/ui/pricing-section";
import { PricingTier } from "@/components/ui/pricing-card";

//Icons

export const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

export const TIERS: PricingTier[] = [
  {
    id: "individual",
    name: "Individuals",
    price: {
      monthly: "Free",
      yearly: "Free",
    },
    description: "Used by art lovers",
    features: [
      "Showcase art & build public portfolio.",
      "Connect with community of artists, fans.",
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
    name: "Pro Artists",
    price: {
      monthly: 12,
      yearly: 10,
    },
    description: "Great for small businesses",
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
    description: "Great for large businesses",
    features: [
      "Everything in Pro Artists plan.",
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

const PurchaseButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center bg-gradient-to-r from-indigo-400 dark:from-indigo-500 to-purple-600 dark:to-purple-700 hover:brightness-105 dark:hover:brightness-110 rounded-full w-24 h-full font-medium text-white transition-all duration-200 cursor-pointer">
          <p>Upgrade</p>
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col dark:bg-mountain-900 dark:border-mountain-700 min-w-[96%] h-[96%]">
        <DialogHeader className="">
          <DialogTitle className="dark:text-white">
            ArtShare Upgrade Packs
          </DialogTitle>
          <DialogDescription className="dark:text-mountain-300">
            Make changes to your journey of discovering art and generating arts.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col justify-center bg-white dark:bg-mountain-900 w-full h-fit">
          <div className="relative flex justify-between items-center w-full">
            <div className="-z-10 absolute inset-0">
              <div className="bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] dark:bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] opacity-30 dark:opacity-20 w-full h-full [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            </div>
            <PricingSection frequencies={PAYMENT_FREQUENCIES} tiers={TIERS} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseButton;
