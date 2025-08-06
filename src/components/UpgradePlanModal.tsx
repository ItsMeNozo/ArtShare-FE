import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { PiStarFourFill } from 'react-icons/pi';

type UpgradePlanModalProps = {
  open: boolean;
  loading?: boolean;
  error?: boolean;
  onClose: () => void;
};

import { useState } from 'react';

function HeroImage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const original = 'https://res.cloudinary.com/dqxtf297o/image/upload/v1753628374/artshare-asset/automation_yh4mze.png';
  const lowRes = original.replace('/upload/', '/upload/w_20,e_blur:1000,q_1/');
  return (
    <div className="relative rounded-lg w-full h-full overflow-hidden">
      <img
        src={lowRes}
        alt="Blurred Placeholder"
        className={`absolute top-0 left-0 w-full h-full object-cover blur-2xl scale-105 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        aria-hidden
      />
      <img
        src={original}
        alt="Upgrade Plan"
        onLoad={() => setIsLoaded(true)}
        className="rounded-lg w-full h-full object-cover transition-opacity duration-700"
        draggable={false}
      />
    </div>
  );
}


const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  open,
  loading = false,
  error = false,
  onClose,
}) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex p-3 border-mountain-200 sm:w-5xl h-[96%]">
        <div className='relative flex bg-black rounded-lg w-2xl h-full shrink-0'>
          <HeroImage />
          <div className='bottom-0 absolute flex justify-between p-2 w-full'>
            <Button
              variant="outline"
              onClick={() => window.open('https://artshare-docs.vercel.app/', '_blank')}
              disabled={loading}
              className="border-mountain-200"
            >
              Learn More
            </Button>
          </div>
        </div>
        <DialogHeader className='flex py-6'>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription className='flex flex-col space-y-4'>
            <p>This feature is available for <strong>Pro users</strong>. Unlock post automation, advanced tools, and more!</p>
            <div className='flex flex-col space-y-2'>
              <div className='flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 p-2 rounded-lg w-full'>
                <p className='font-medium text-lg'>Creative Pro Pack</p>
              </div>
              <div className="flex flex-col space-y-2 text-sm">
                {[
                  'Includes all Free plan features.',
                  'Use advanced AI models for better art.',
                  'Get a larger monthly AI quota.',
                  'Generate high-res art without watermark.',
                  'Gain commercial rights (T&Cs apply).',
                  'Smarter, trend-based prompt suggestions.',
                  'Organize art with portfolio collections.',
                  'More storage for your artwork.',
                ].map((text, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <PiStarFourFill className="text-purple-900 shrink-0" />
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 mt-4 px-3 py-2 border border-destructive/30 rounded-md text-destructive text-sm">
            <AlertCircle className="size-4" />
            <span>Something went wrong. Please try again.</span>
          </div>
        )}
        <div className='right-4 bottom-4 absolute space-x-2'>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              onClose();
              navigate('/app-subscription');
            }}
            disabled={loading}
            className='bg-mountain-1000 hover:bg-mountain-900 disabled:bg-gray-500 text-white disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </span>
            ) : (
              'Upgrade Now'
            )}
          </Button>
        </div>

      </DialogContent>
    </Dialog >
  );
};

export default UpgradePlanModal;
