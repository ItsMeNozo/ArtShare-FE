//Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PricingSection } from '@/components/ui/pricing-section';
import { PAYMENT_FREQUENCIES, TIERS } from '@/constants/planTiers';

const PurchaseButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex h-full w-24 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 to-purple-600 font-medium text-white transition-all duration-200 hover:brightness-105 dark:from-indigo-500 dark:to-purple-700 dark:hover:brightness-110">
          <p>Upgrade</p>
        </div>
      </DialogTrigger>
      <DialogContent className="dark:bg-mountain-900 dark:border-mountain-700 flex h-[96%] min-w-[96%] flex-col">
        <DialogHeader className="">
          <DialogTitle className="dark:text-white">
            ArtShare Upgrade Packs
          </DialogTitle>
          <DialogDescription className="dark:text-mountain-300">
            Make changes to your journey of discovering art and generating arts.
          </DialogDescription>
        </DialogHeader>
        <div className="dark:bg-mountain-900 flex h-fit w-full flex-col justify-center bg-white">
          <div className="relative flex w-full items-center justify-between">
            <div className="absolute inset-0 -z-10">
              <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:35px_35px] opacity-30 dark:bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] dark:opacity-20" />
            </div>
            <PricingSection frequencies={PAYMENT_FREQUENCIES} tiers={TIERS} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseButton;
