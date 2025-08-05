import InlineErrorMessage from '@/components/InlineErrorMessage';
import { SharePlatformName } from '@/features/media-automation/types';
import {
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from '@mui/material';
import { ErrorMessage, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { FaFacebookSquare } from 'react-icons/fa';
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

  const { data: fetchedPlatforms = [], isLoading } = useFetchLinkedPlatforms({
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

  const handlePlatformSelected = (platformId: string) => {
    const platform = fetchedPlatforms.find(
      (p) => p.id.toString() === platformId,
    );
    if (platform) {
      setSelectedPlatform(platform);
      setFieldValue(`${name}.id`, platform.id);
      setFieldValue(`${name}.name`, platform.name);
    }
  };

  const handlePlatformTypeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as SharePlatformName;
    setPlatformTypeToFetch(value);
    setSelectedPlatform(null);
    setFieldValue(`${name}.id`, -1);
  };

  const isTokenExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  useEffect(() => {
    if (!selectedPlatform && fetchedPlatforms.length > 0) {
      const firstPlatform = fetchedPlatforms[0];
      setSelectedPlatform(firstPlatform);
      setFieldValue(`${name}.id`, firstPlatform.id);
      setFieldValue(`${name}.name`, firstPlatform.name);
    }
  }, [fetchedPlatforms, selectedPlatform, setFieldValue]);

  useEffect(() => {
    if (!isEditMode) {
      const initialType = allAvailablePlatformTypes.find(
        (type) => type !== 'INSTAGRAM',
      );
      if (initialType) {
        setPlatformTypeToFetch(initialType);
      }
    }
  }, [isEditMode]);

  const { data: fbAccountInfo } = useFacebookAccountInfo();
  const facebookProfile =
    fbAccountInfo && fbAccountInfo.length > 0
      ? {
        name: fbAccountInfo[0].name,
        profilePicture:
          fbAccountInfo[0].pictureUrl || 'https://i.pravatar.cc/150',
      }
      : null;

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex flex-col justify-start items-center w-xl h-full">
        <div className="flex justify-center items-center bg-indigo-50 p-1 rounded-full w-fit">
          <Typography
            variant="body1"
            component="h1"
            className="mr-2 pl-2 font-normal"
          >
            {isEditMode ? 'Edit' : 'Create'}{' '}
            <span className="font-semibold">Automation Project</span>
          </Typography>
          <Select
            disabled={isEditMode}
            onChange={handlePlatformTypeChange}
            value={platformTypeToFetch || ''}
            className="bg-white rounded-full font-medium text-lg"
            sx={{
              '.MuiOutlinedInput-notchedOutline': { border: 0 },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
              minWidth: '180px',
            }}
          >
            {allAvailablePlatformTypes.map((type) =>
              type === 'INSTAGRAM' ? (
                <Tooltip
                  key={type}
                  title="Instagram integration is coming soon!"
                  placement="right"
                >
                  {/* The span is necessary for the tooltip to work on a disabled item */}
                  <span>
                    <MenuItem value={type} disabled className="text-lg">
                      <img
                        src={ins_icon}
                        alt="Instagram"
                        className="inline-block mr-2 w-6 h-6"
                      />
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </MenuItem>
                  </span>
                </Tooltip>
              ) : (
                <MenuItem key={type} value={type} className="text-lg">
                  <img
                    src={fb_icon}
                    alt="Facebook"
                    className="inline-block mr-2 w-6 h-6"
                  />
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </MenuItem>
              ),
            )}
          </Select>
          <ErrorMessage name={`${name}.id`}>
            {(errorMsg) => <InlineErrorMessage errorMsg={errorMsg} />}
          </ErrorMessage>
        </div>
        <div className="flex flex-col justify-center items-center space-y-2 mt-4 w-full h-full">
          <div className="flex justify-center w-full">
            {isLoading && (
              <div className="group relative flex flex-col justify-center items-center p-4 w-xl h-42 text-center cursor-not-allowed">
                <p>Loading platforms...</p>
              </div>
            )}
            {!isLoading && platformTypeToFetch === 'FACEBOOK' && (
              <>
                {fetchedPlatforms.length > 0 ? (
                  <div className="flex flex-col justify-center items-center space-y-2 w-full h-42">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={facebookProfile?.profilePicture}
                          className="rounded-full size-20"
                          alt="Facebook Profile"
                        />
                        <span className="font-medium text-sm">
                          {facebookProfile?.name}
                        </span>
                      </div>
                    </div>
                    {selectedPlatform && (
                      <div className="relative flex justify-between items-center bg-white px-2 rounded-full w-full h-12 text-sm">
                        <div className="bg-gray-200 p-2 px-4 rounded-full select-none">
                          <p>Target Page</p>
                        </div>
                        <Select
                          value={selectedPlatform.id.toString()}
                          onChange={(e) =>
                            handlePlatformSelected(e.target.value)
                          }
                          disabled={isEditMode}
                          className="top-1/2 left-1/2 absolute h-12 -translate-x-1/2 -translate-y-1/2"
                          sx={{
                            '.MuiOutlinedInput-notchedOutline': { border: 0 },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: 0,
                            },
                            minWidth: '250px',
                          }}
                        >
                          {fetchedPlatforms.map((platform) => (
                            <MenuItem
                              key={platform.id}
                              value={platform.id.toString()}
                            >
                              <div className="flex items-center space-x-2 w-full">
                                <FaFacebookSquare className="size-4 text-blue-700 shrink-0" />
                                <span className="flex-grow line-clamp-1">
                                  {platform.config.pageName}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <div
                                    className={`h-2 w-2 rounded-full ${isTokenExpired(platform.tokenExpiresAt)
                                      ? 'bg-red-500'
                                      : 'bg-green-500'
                                      }`}
                                  />
                                  <span className="text-xs capitalize">
                                    {isTokenExpired(platform.tokenExpiresAt)
                                      ? 'Expired'
                                      : platform.status.toLowerCase()}
                                  </span>
                                </div>
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
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
