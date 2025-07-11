import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';

import AsyncWrapper from '@/components/AsyncWrapper';
import { useSubscriptionInfo } from '@/hooks/useSubscription';
import { BiSolidCoinStack } from 'react-icons/bi';

const TokenPopover: React.FC = () => {
  const [open, setOpen] = useState(false);

  const {
    data: subscriptionInfo,
    isLoading: loadingSubscriptionInfo,
    isError: isSubscriptionError,
  } = useSubscriptionInfo();

  const isPopOverVisible = !loadingSubscriptionInfo && !isSubscriptionError;

  const tokenNumber = subscriptionInfo?.aiCreditRemaining || 0;

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center space-x-1 px-2"
          onMouseEnter={() => isPopOverVisible && setOpen(true)}
        >
          <AsyncWrapper
            loading={loadingSubscriptionInfo}
            error={isSubscriptionError}
          >
            <BiSolidCoinStack className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-gray-800 dark:text-gray-100">
              {tokenNumber}
            </span>
          </AsyncWrapper>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="dark:bg-mountain-900 border-mountain-100 dark:border-mountain-700 mt-4 w-80 p-3"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex flex-col space-y-2">
          <p className="inline-block w-fit bg-gradient-to-r from-pink-600 via-purple-500 to-indigo-700 bg-clip-text text-3xl font-medium text-transparent">
            {tokenNumber}
          </p>
          <p>credits remaining, get more with</p>
          {/* <Button>Upgrade</Button> */}
        </div>
        <hr className="border-mountain-100 dark:border-mountain-800 my-2 border-t-1" />
        <div className="flex flex-col space-y-2">
          <p className="text-mountain-700 text-sm">
            Estimated remaining based on your credits
          </p>
          <div className="flex w-full">
            <p className="flex w-1/2">
              ~
              {Math.floor(tokenNumber / 5) > 1
                ? Math.floor(tokenNumber / 5) + ' Images'
                : Math.floor(tokenNumber / 5) + ' Image'}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TokenPopover;
