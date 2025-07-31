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
        <div className="flex justify-center items-center bg-gradient-to-r from-indigo-400 dark:from-indigo-500 to-purple-600 dark:to-purple-700 hover:brightness-105 dark:hover:brightness-110 rounded-full w-24 h-full font-medium text-white transition-all duration-200 cursor-pointer">
          <p>Upgrade</p>
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col dark:bg-mountain-900 border-mountain-200 dark:border-mountain-700 min-w-[96%] h-[96%]">
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
