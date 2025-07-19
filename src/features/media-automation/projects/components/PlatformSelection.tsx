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
    <div className="flex h-full flex-col">
      <div className="relative flex h-full w-xl flex-col items-center justify-start">
        <div className="flex w-fit items-center justify-center rounded-full bg-indigo-50 p-1">
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
            className="rounded-full bg-white text-lg font-medium"
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
                        className="mr-2 inline-block h-6 w-6"
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
                    className="mr-2 inline-block h-6 w-6"
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
        <div className="mt-4 flex h-full w-full flex-col items-center justify-center space-y-2">
          <div className="flex w-full justify-center">
            {isLoading && (
              <div className="group relative flex h-42 w-xl cursor-not-allowed flex-col items-center justify-center p-4 text-center">
                <p>Loading platforms...</p>
              </div>
            )}
            {!isLoading && platformTypeToFetch === 'FACEBOOK' && (
              <>
                {fetchedPlatforms.length > 0 ? (
                  <div className="flex h-42 w-full flex-col items-center justify-center space-y-2">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={facebookProfile?.profilePicture}
                          className="size-20 rounded-full"
                          alt="Facebook Profile"
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
                        <Select
                          value={selectedPlatform.id.toString()}
                          onChange={(e) =>
                            handlePlatformSelected(e.target.value)
                          }
                          disabled={isEditMode}
                          className="absolute top-1/2 left-1/2 h-12 -translate-x-1/2 -translate-y-1/2"
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
                              <div className="flex w-full items-center space-x-2">
                                <FaFacebookSquare className="size-4 shrink-0 text-blue-700" />
                                <span className="line-clamp-1 flex-grow">
                                  {platform.config.pageName}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <div
                                    className={`h-2 w-2 rounded-full ${
                                      isTokenExpired(platform.tokenExpiresAt)
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
