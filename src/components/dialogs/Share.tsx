// This component is currently not being used in the app. Previously it was used in BlogDetails.tsx
import React, { useState } from 'react';

//Components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  PopperPlacementType,
  Tooltip,
} from '@mui/material';

//Libs
import { cn } from '@/lib/utils';

//Icons
import { Share2, X } from 'lucide-react';
import { FaFacebookF, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { LuCheck, LuCopy } from 'react-icons/lu';

type ShareDialogProp = {
  tooltipDirection: PopperPlacementType;
  className: string;
  iconClassName?: string;
  link: string;
};

const Share: React.FC<ShareDialogProp> = ({
  tooltipDirection,
  className,
  link,
  iconClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    setOpen(false);
    setCopied(false); // Reset when closing dialog
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <>
      <Tooltip title="Share" placement={tooltipDirection} arrow>
        <div onClick={handleOpen} className={cn(className)}>
          <Share2 className={cn('size-4', iconClassName)} />
        </div>
      </Tooltip>
      <Dialog
        onClick={(e) => e.stopPropagation()}
        open={open}
        onClose={handleClose}
        disableScrollLock
      >
        <DialogTitle className="flex items-center justify-between">
          <p>Share This Blog</p>
          <X className="size-4 hover:cursor-pointer" onClick={handleClose} />
        </DialogTitle>

        <DialogContent className="flex w-106 flex-col items-center justify-center space-y-4">
          <div className="relative flex h-16 w-full items-center justify-end rounded-full border-1 p-1">
            <p className="absolute left-4 line-clamp-1 text-lg">{link}</p>
            <div className="absolute right-8 flex h-full w-42 bg-white blur-xl" />
            <div
              onClick={copied ? undefined : handleCopy}
              className={cn(
                'text-mountain-50 z-50 flex h-full w-36 items-center justify-center space-x-2 rounded-full font-medium transition-all duration-200',
                copied
                  ? 'bg-mountain-700 hover:cursor-not-allowed'
                  : 'bg-mountain-950 hover:bg-mountain-900 hover:cursor-pointer',
              )}
            >
              {copied ? (
                <>
                  <LuCheck className="size-5" />
                  <p>Copied</p>
                </>
              ) : (
                <>
                  <LuCopy className="size-5" />
                  <p>Copy Link</p>
                </>
              )}
            </div>
          </div>

          <hr className="border-mountain-200 flex w-full border-t-1" />
          <span className="text-xs">Or use other embedded links</span>

          <div className="flex w-full justify-center space-x-8">
            <SocialButton
              icon={<FaLinkedin className="size-5 group-hover:text-white" />}
              label="Linkedin"
              color="bg-cyan-700/80"
            />
            <SocialButton
              icon={<FaFacebookF className="size-5 group-hover:text-white" />}
              label="Facebook"
              color="bg-blue-900/80"
            />
            <SocialButton
              icon={<FaXTwitter className="size-5 group-hover:text-white" />}
              label="X"
              color="bg-mountain-950"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const SocialButton = ({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) => (
  <div className="group flex flex-col items-center justify-center space-y-2 hover:cursor-pointer">
    <div
      className={cn(
        'bg-mountain-100 flex h-12 w-12 items-center justify-center rounded-full',
        `group-hover:${color}`,
      )}
    >
      {icon}
    </div>
    <span className="text-xs">{label}</span>
  </div>
);

export default Share;
