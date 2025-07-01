import api from '@/api/baseApi';
import InlineErrorMessage from '@/components/InlineErrorMessage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SharePlatformName } from '@/features/media-automation/types';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Menu, MenuItem } from '@mui/material';
import { ErrorMessage, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { FaFacebookSquare, FaInstagram } from 'react-icons/fa';
import { FiRepeat } from 'react-icons/fi';
import { IoMdMore } from 'react-icons/io';
import { useFetchLinkedPlatforms } from '../hooks/useFetchLinkedPlatforms';
import { FormPlatform, ProjectFormValues } from '../types';
import { Platform } from '../types/platform';

const name = 'platform';

const PlatformSelection = () => {
  const { setFieldValue, getFieldMeta } = useFormikContext<ProjectFormValues>();
  const { showSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const initialPlatform = getFieldMeta(name).initialValue as FormPlatform;
  const [platformTypeToFetch, setPlatformTypeToFetch] =
    useState<SharePlatformName | null>(() =>
      isValidInitialPlatform(initialPlatform)
        ? (initialPlatform.name as SharePlatformName)
        : null,
    );

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  );

  const [platformToReconnect, setPlatformToReconnect] =
    useState<Platform | null>(null);

  const {
    data: fetchedPlatforms = [],
    isLoading,
    error,
  } = useFetchLinkedPlatforms({
    platformName: platformTypeToFetch,
  });

  useEffect(() => {
    if (
      fetchedPlatforms.length > 0 &&
      isValidInitialPlatform(initialPlatform)
    ) {
      const foundPlatform = fetchedPlatforms.find(
        (p) => p.id === initialPlatform.id,
      );
      setSelectedPlatform(foundPlatform!);
    } else {
      setSelectedPlatform(null);
    }
  }, [fetchedPlatforms, initialPlatform]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    platform: Platform,
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);

    setPlatformToReconnect(platform);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setPlatformToReconnect(null);
  };

  const handlePlatformSelected = (platform: Platform) => {
    setSelectedPlatform(platform);
    setFieldValue(`${name}.id`, platform.id);
    setFieldValue(`${name}.name`, platform.name);
  };
  const handlePlatformTypeChange = (value: SharePlatformName) => {
    setPlatformTypeToFetch(value);
    setSelectedPlatform(null);
    // Reset the Formik field value when the type changes
    setFieldValue(`${name}.id`, -1);
  };

  const handleReconnectClick = () => {
    if (platformToReconnect) {
      console.log(
        `Reconnecting platform: ${platformToReconnect.config.page_name}`,
      );

      handleReconnect(platformToReconnect);
    }
    handleMenuClose();
  };

  const handleReconnect = async (platform?: Platform) => {
    try {
      if (platform) {
        console.log(
          `Initiating reconnection for ${platform.name} page: ${platform.config.page_name}`,
        );
      }
      const currentPageUrl = window.location.href;
      const encodedRedirectUrl = encodeURIComponent(currentPageUrl);

      console.log(
        `Initiating reconnection. Will redirect to: ${currentPageUrl}`,
      );

      const response = await api.get(
        `/facebook-integration/initiate-connection-url?successUrl=${encodedRedirectUrl}&errorUrl=${encodedRedirectUrl}`,
      );
      const { facebookLoginUrl } = response.data;
      if (facebookLoginUrl) {
        window.location.href = facebookLoginUrl;
      }
    } catch (error) {
      console.error('Failed to get reconnection URL', error);
      showSnackbar('Could not initiate reconnection. Please try again later.');
    }
  };

  const isTokenExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-semibold capitalize">
        🌐 Platform Integration
      </h2>
      <div className="flex flex-col w-xl">
        <label className="block mb-1 font-medium">
          Select Platform
          <span className="text-red-600">*</span>
        </label>
        <Select onValueChange={handlePlatformTypeChange}>
          <SelectTrigger className="w-[180px] data-[size=default]:h-10">
            <SelectValue placeholder="Choose Platform" />
          </SelectTrigger>
          <SelectContent className="border-mountain-100">
            {allAvailablePlatformTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ErrorMessage name={`${name}.id`}>
          {(errorMsg) => <InlineErrorMessage errorMsg={errorMsg} />}
        </ErrorMessage>

        <label className="block mt-6 mb-1 font-medium">
          Choose Account
          <span className="text-red-600">*</span>
        </label>

        {isLoading && <p>Loading platforms...</p>}
        {error && <p className="text-red-500">{error.message}</p>}

        {!isLoading && !error && platformTypeToFetch === 'INSTAGRAM' && (
          <div className="relative flex flex-col items-center justify-center p-4 text-center bg-gray-100 border cursor-not-allowed group h-36 rounded-3xl opacity-80">
            <FaInstagram className="w-10 h-10 mb-2 text-gray-500" />
            <p className="text-sm font-semibold text-gray-700">
              Instagram integration is coming soon!
            </p>
            <p className="text-xs text-gray-500">
              Please select another platform to continue.
            </p>
          </div>
        )}

        {!isLoading && !error && platformTypeToFetch === 'FACEBOOK' && (
          <>
            {fetchedPlatforms.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {fetchedPlatforms.map((platform) => {
                  const expired = isTokenExpired(platform.token_expires_at);
                  return (
                    <button
                      type="button"
                      key={platform.id}
                      className={`border group relative justify-between bg-mountain-50/60 h-36 p-4 items-start rounded-3xl flex flex-col hover:shadow-md transition ${
                        selectedPlatform?.id === platform.id
                          ? 'ring-2 ring-mountain-500 border-mountain-500'
                          : 'border-gray-300'
                      }`}
                      onClick={() => handlePlatformSelected(platform)}
                    >
                      <div className="flex flex-col items-start space-y-1">
                        {platform.name === 'FACEBOOK' && (
                          <FaFacebookSquare className="text-blue-700 size-10" />
                        )}
                      </div>
                      <span className="font-medium line-clamp-1">
                        {platform.config.page_name}
                      </span>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${expired ? 'bg-red-500' : 'bg-green-500'}`}
                          />
                          <span className="text-xs capitalize">
                            {expired
                              ? 'Expired'
                              : platform.status.toLowerCase()}
                          </span>
                        </div>
                        {platform.token_expires_at && !expired && (
                          <span className="text-xs">
                            Expires{' '}
                            {new Date(
                              platform.token_expires_at,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div
                        onClick={(e) => handleMenuOpen(e, platform)}
                        className="absolute flex invisible duration-300 ease-in-out transform bg-white border rounded-md opacity-0 cursor-pointer group-hover:visible top-4 right-4 group-hover:opacity-100 border-mountain-100"
                      >
                        <IoMdMore className="size-6 text-mountain-600" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
                <p className="font-semibold">No Facebook Pages Found</p>
                <p className="mb-3 text-sm text-gray-600">
                  You haven't connected any Facebook pages yet.
                </p>
                <button
                  type="button"
                  onClick={() => handleReconnect()}
                  className="mt-2 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Connect a Page
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && !platformTypeToFetch && (
          <p className="text-sm text-mountain-600">
            Please select a platform to continue.
          </p>
        )}
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleReconnectClick}>
          <FiRepeat className="mr-2" />
          Refresh connection
        </MenuItem>
      </Menu>
    </div>
  );
};
export default PlatformSelection;

const allAvailablePlatformTypes: SharePlatformName[] = [
  'FACEBOOK',
  'INSTAGRAM',
];
const isValidInitialPlatform = (
  platform: FormPlatform | null | undefined,
): boolean => {
  return !!platform && platform.id > 0 && !!platform.name;
};
