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
import { useFetchLinkedPlatforms } from '../hooks/useFetchLinkedPlatforms';
import { FormPlatform, ProjectFormValues } from '../types';
import { Platform } from '../types/platform';
import { PiArrowsClockwise } from 'react-icons/pi';
import fb_icon from '/fb_icon.svg';
import ins_icon from '/ins_icon.svg';
import { Link } from 'react-router-dom';
import { useFacebookAccountInfo } from '../../social-links/hooks/useFacebook';

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
      !selectedPlatform &&             // Only auto-select if none is selected yet
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
    <div className="flex flex-col h-full">
      <div className="relative flex flex-col justify-start items-center w-xl h-full">
        <div className="flex justify-center items-center bg-indigo-50 pl-2 rounded-full w-fit">
          <Typography variant="body1" component="h1" className='mr-2 font-normal'>
            {isEditMode ? 'Edit' : 'Create'} <span className='font-semibold'>Automation Project</span>
          </Typography>
          <Select disabled={isEditMode} onValueChange={handlePlatformTypeChange} value={selectedPlatform?.name || platformTypeToFetch || ''}>
            <SelectTrigger className="bg-white rounded-full w-42 data-[size=default]:h-10 font-medium text-lg cursor-pointer">
              <SelectValue placeholder="Choose Platform" />
            </SelectTrigger>
            <SelectContent className="border-mountain-100 w-full">
              {allAvailablePlatformTypes.map((type) => (
                <SelectItem key={type} value={type} className='text-lg'>
                  {type === 'FACEBOOK' ? <img src={fb_icon} alt="Facebook" className="inline-block w-6 h-6" /> : type === 'INSTAGRAM' ? <img src={ins_icon} className="inline-block w-6 h-6" /> : null}
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage name={`${name}.id`}>
            {(errorMsg) => <InlineErrorMessage errorMsg={errorMsg} />}
          </ErrorMessage>
        </div>
        <div className='flex flex-col justify-center items-center space-y-2 w-full h-full'>
          <div className='flex justify-center w-full'>
            {isLoading &&
              <div className="group relative flex flex-col justify-center items-center p-4 w-xl h-42 text-center cursor-not-allowed">
                <p>Loading platforms...</p>
              </div>
            }
            {!isLoading && error && platformTypeToFetch === 'INSTAGRAM' && (
              <div className="group relative flex flex-col justify-center items-center bg-gray-100 opacity-80 p-4 border border-mountain-200 rounded-3xl w-xl h-42 text-center cursor-not-allowed">
                <FaInstagram className="mb-2 w-10 h-10 text-gray-500" />
                <p className="font-semibold text-gray-700 text-sm">
                  Instagram integration is coming soon!
                </p>
                <p className="text-gray-500 text-xs">
                  Please select another platform to continue.
                </p>
              </div>
            )}
            {!isLoading && !error && platformTypeToFetch === 'FACEBOOK' && (
              <>
                {fetchedPlatforms.length > 0 ? (
                  <div className="flex flex-col justify-center items-center space-y-2 w-full h-42">
                    <div className='flex flex-col items-center space-y-1'>
                      <div className='flex flex-col items-center space-y-2'>
                        <img src={facebookProfile?.profilePicture} className='rounded-full size-20' />
                        <span className='font-medium text-sm'>{facebookProfile?.name}</span>
                      </div>
                    </div>
                    {selectedPlatform && (
                      <div className='relative flex justify-between items-center bg-white px-2 rounded-full w-full h-12 text-sm'>
                        <div className='bg-gray-200 p-2 px-4 rounded-full select-none'>
                          <p>Target Page</p>
                        </div>
                        <button
                          type="button"
                          key={selectedPlatform.id}
                          className={`absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center space-x-4 h-12 w-fit transition`}
                          onClick={() => handlePlatformSelected(selectedPlatform)}
                        >
                          <div className='flex items-center space-x-2'>
                            {selectedPlatform.name === 'FACEBOOK' && (
                              <FaFacebookSquare className="rounded-full size-4 text-blue-700 shrink-0" />
                            )}
                            <span className="w-24 text-left line-clamp-1">
                              {selectedPlatform.config.page_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${isTokenExpired(selectedPlatform.token_expires_at) ? 'bg-red-500' : 'bg-green-500'}`}
                            />
                            <span className="text-xs capitalize">
                              {isTokenExpired(selectedPlatform.token_expires_at)
                                ? 'Expired'
                                : selectedPlatform.status.toLowerCase()}
                            </span>
                          </div>
                        </button>
                        <button disabled={isEditMode} type='button' className='flex items-center space-x-1 hover:bg-gray-200 disabled:hover:bg-white disabled:opacity-50 p-2 rounded-full cursor-pointer disabled:cursor-not-allowed'>
                          <p className='text-sm'>Change page</p>
                          <PiArrowsClockwise className='inline-block size-4' />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 bg-mountain-50/80 p-6 border-2 border-gray-300 border-dashed rounded-lg text-center">
                    <p className="font-medium">No Facebook Pages Found</p>
                    <p className="text-gray-600 text-xs">
                      You haven't connected any Facebook pages yet.
                    </p>
                    <Link
                      to="/auto/social-links"
                      className="bg-blue-600 hover:bg-blue-700 mt-2 px-5 py-2.5 rounded-lg font-medium text-white text-sm"
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
    </div >
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
