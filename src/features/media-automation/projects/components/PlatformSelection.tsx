// import api from '@/api/baseApi';
import InlineErrorMessage from '@/components/InlineErrorMessage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SharePlatformName } from '@/features/media-automation/types';
// import { useSnackbar } from '@/hooks/useSnackbar';
import { Typography } from '@mui/material';
import { ErrorMessage, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { FaFacebookSquare, FaInstagram } from 'react-icons/fa';
import { PiArrowsClockwise } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { useFacebookAccountInfo } from '../../social-links/hooks/useFacebook';
import { useFetchLinkedPlatforms } from '../hooks/useFetchLinkedPlatforms';
import { FormPlatform, ProjectFormValues } from '../types';
import { Platform } from '../types/platform';
import fb_icon from '/fb_icon.svg';
import ins_icon from '/ins_icon.svg';

const name = 'platform';

type PlatformSelectionProps = {
  isEditMode?: boolean;
};
const PlatformSelection = ({ isEditMode = false }: PlatformSelectionProps) => {
  const { setFieldValue, getFieldMeta } = useFormikContext<ProjectFormValues>();
  // const { showSnackbar } = useSnackbar();
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  // const [platformToReconnect, setPlatformToReconnect] =
  //   useState<Platform | null>(null);
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

  // const handleMenuOpen = (
  //   event: React.MouseEvent<HTMLElement>,
  //   platform: Platform,
  // ) => {
  //   event.stopPropagation();
  //   setAnchorEl(event.currentTarget);

  //   setPlatformToReconnect(platform);
  // };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  //   setPlatformToReconnect(null);
  // };

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

  // const handleReconnectClick = () => {
  //   if (platformToReconnect) {
  //     console.log(
  //       `Reconnecting platform: ${platformToReconnect.config.page_name}`,
  //     );

  //     handleReconnect(platformToReconnect);
  //   }
  //   handleMenuClose();
  // };

  // const handleReconnect = async (platform?: Platform) => {
  //   try {
  //     if (platform) {
  //       console.log(
  //         `Initiating reconnection for ${platform.name} page: ${platform.config.page_name}`,
  //       );
  //     }
  //     const currentPageUrl = window.location.href;
  //     const encodedRedirectUrl = encodeURIComponent(currentPageUrl);

  //     console.log(
  //       `Initiating reconnection. Will redirect to: ${currentPageUrl}`,
  //     );

  //     const response = await api.get(
  //       `/facebook-integration/initiate-connection-url?successUrl=${encodedRedirectUrl}&errorUrl=${encodedRedirectUrl}`,
  //     );
  //     const { facebookLoginUrl } = response.data;
  //     if (facebookLoginUrl) {
  //       window.location.href = facebookLoginUrl;
  //     }
  //   } catch (error) {
  //     console.error('Failed to get reconnection URL', error);
  //     showSnackbar('Could not initiate reconnection. Please try again later.');
  //   }
  // };

  const isTokenExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  useEffect(() => {
    if (
      !selectedPlatform && // Only auto-select if none is selected yet
      fetchedPlatforms.length > 0
    ) {
      const firstPlatform = fetchedPlatforms[0];
      setSelectedPlatform(firstPlatform);

      // Update Formik values too
      setFieldValue(`${name}.id`, firstPlatform.id);
      setFieldValue(`${name}.name`, firstPlatform.name);
    }
  }, [fetchedPlatforms, selectedPlatform, setFieldValue]);

  useEffect(() => {
    if (!isEditMode) {
      const initialType = allAvailablePlatformTypes[0];
      if (initialType) {
        handlePlatformTypeChange(initialType);
      }
    }
  }, []);

  const { data: fbAccountInfo } = useFacebookAccountInfo();
  const facebookProfile =
    fbAccountInfo && fbAccountInfo.length > 0
      ? {
          name: fbAccountInfo[0].name,
          profilePicture:
            fbAccountInfo[0].picture_url || 'https://i.pravatar.cc/150',
        }
      : null;

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex h-full w-xl flex-col items-center justify-start">
        <div className="flex w-fit items-center justify-center rounded-full bg-indigo-50 pl-2">
          <Typography
            variant="body1"
            component="h1"
            className="mr-2 font-normal"
          >
            {isEditMode ? 'Edit' : 'Create'}{' '}
            <span className="font-semibold">Automation Project</span>
          </Typography>
          <Select
            disabled={isEditMode}
            onValueChange={handlePlatformTypeChange}
            value={selectedPlatform?.name || platformTypeToFetch || ''}
          >
            <SelectTrigger className="w-42 cursor-pointer rounded-full bg-white text-lg font-medium data-[size=default]:h-10">
              <SelectValue placeholder="Choose Platform" />
            </SelectTrigger>
            <SelectContent className="border-mountain-100 w-full">
              {allAvailablePlatformTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-lg">
                  {type === 'FACEBOOK' ? (
                    <img
                      src={fb_icon}
                      alt="Facebook"
                      className="inline-block h-6 w-6"
                    />
                  ) : type === 'INSTAGRAM' ? (
                    <img src={ins_icon} className="inline-block h-6 w-6" />
                  ) : null}
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage name={`${name}.id`}>
            {(errorMsg) => <InlineErrorMessage errorMsg={errorMsg} />}
          </ErrorMessage>
        </div>
        <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
          <div className="flex w-full justify-center">
            {isLoading && (
              <div className="group relative flex h-42 w-xl cursor-not-allowed flex-col items-center justify-center p-4 text-center">
                <p>Loading platforms...</p>
              </div>
            )}
            {!isLoading && error && platformTypeToFetch === 'INSTAGRAM' && (
              <div className="group border-mountain-200 relative flex h-42 w-xl cursor-not-allowed flex-col items-center justify-center rounded-3xl border bg-gray-100 p-4 text-center opacity-80">
                <FaInstagram className="mb-2 h-10 w-10 text-gray-500" />
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
                  <div className="flex h-42 w-full flex-col items-center justify-center space-y-2">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={facebookProfile?.profilePicture}
                          className="size-20 rounded-full"
                        />
                        <span className="text-sm font-medium">
                          {facebookProfile?.name}
                        </span>
                      </div>
                    </div>
                    {selectedPlatform && (
                      <div className="relative flex h-12 w-full items-center justify-between rounded-full bg-white px-2 text-sm">
                        <div className="rounded-full bg-gray-200 p-2 px-4 select-none">
                          <p>Target Page</p>
                        </div>
                        <button
                          type="button"
                          key={selectedPlatform.id}
                          className={`absolute top-1/2 left-1/2 flex h-12 w-fit -translate-x-1/2 -translate-y-1/2 items-center space-x-4 transition`}
                          onClick={() =>
                            handlePlatformSelected(selectedPlatform)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            {selectedPlatform.name === 'FACEBOOK' && (
                              <FaFacebookSquare className="size-4 shrink-0 rounded-full text-blue-700" />
                            )}
                            <span className="line-clamp-1 w-24 text-left">
                              {selectedPlatform.config.page_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-2 w-2 rounded-full ${isTokenExpired(selectedPlatform.token_expires_at) ? 'bg-red-500' : 'bg-green-500'}`}
                            />
                            <span className="text-xs capitalize">
                              {isTokenExpired(selectedPlatform.token_expires_at)
                                ? 'Expired'
                                : selectedPlatform.status.toLowerCase()}
                            </span>
                          </div>
                        </button>
                        <button
                          disabled={isEditMode}
                          type="button"
                          className="flex cursor-pointer items-center space-x-1 rounded-full p-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                        >
                          <p className="text-sm">Change page</p>
                          <PiArrowsClockwise className="inline-block size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-mountain-50/80 flex flex-col items-center space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                    <p className="font-medium">No Facebook Pages Found</p>
                    <p className="text-xs text-gray-600">
                      You haven't connected any Facebook pages yet.
                    </p>
                    <Link
                      to="/auto/social-links"
                      className="mt-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Go to Link Social
                    </Link>
                  </div>
                )}
              </>
            )}
            {!isLoading && !platformTypeToFetch && (
              <p className="text-mountain-600 text-sm">
                Please select a platform to continue.
              </p>
            )}
          </div>
        </div>
      </div>
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
