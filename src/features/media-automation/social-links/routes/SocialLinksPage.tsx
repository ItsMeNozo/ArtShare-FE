import { toTitleCase } from '@/utils/common';
import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Newspaper, Plus, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MdLogout } from 'react-icons/md';
import { PiArrowsClockwise } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import UserGuide from '../components/UserGuide';
import { useFacebookAccountInfo, useFacebookAuth } from '../hooks/useFacebook';
import {
  useDisconnectPlatform,
  useFetchPlatforms,
} from '../hooks/usePlatforms';
import fb_icon from '/fb_icon.svg';
import ins_icon from '/ins_icon.svg';

const SocialLinksPage = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Facebook');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogUserGuideOpen, setDialogUserGuideOpen] =
    useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data: platforms, isLoading: isLoadingPlatforms } =
    useFetchPlatforms();
  const { data: fbAccountInfo, isLoading: isLoadingFbAccountInfo } =
    useFacebookAccountInfo();
  const { mutate: disconnect } = useDisconnectPlatform();
  const { initiateFacebookConnection, isLoading: isConnecting } =
    useFacebookAuth({
      onError: (error) => {
        console.error('Failed to initiate Facebook connection:', error);
        alert(
          'Error: Could not start the connection process. Please try again later.',
        );
      },
    });

  // Handle OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      queryClient.invalidateQueries({ queryKey: ['facebookAccountInfo'] });
      // Clean up URL for a better user experience
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('status') === 'error') {
      alert('Failed to connect to Facebook. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [queryClient]);

  const handleDisconnect = (platformId: number) => {
    if (window.confirm('Are you sure you want to disconnect this page?')) {
      disconnect(platformId);
    }
  };

  const platformsMenu = ['Facebook', 'Instagram'];
  const facebookProfile =
    fbAccountInfo && fbAccountInfo.length > 0
      ? {
          name: fbAccountInfo[0].name,
          profilePicture:
            fbAccountInfo[0].picture_url || 'https://i.pravatar.cc/150',
        }
      : null;

  const facebookPages = platforms?.filter((p) => p.name === 'FACEBOOK') ?? [];

  const getPlatformIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'facebook':
        return fb_icon;
      case 'instagram':
        return ins_icon;
      default:
        return null;
    }
  };

  const isLoading = isLoadingPlatforms || isLoadingFbAccountInfo;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full h-[calc(100vh-4rem)]">
      <div className="flex w-full h-full gap-4">
        {/* Filter Panel */}
        <div className="flex flex-col w-1/4 h-full gap-2 space-y-2 bg-white border border-mountain-200 rounded-3xl">
          <div className="flex items-center w-full h-20 p-2 border-mountain-200 border-b-1">
            <div
              onClick={() => setDialogOpen(!dialogOpen)}
              className="flex items-center justify-center w-full h-full gap-2 p-2 text-white transform border cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-105 border-mountain-200 rounded-xl"
            >
              <Plus />
              <p>Connect Platform</p>
            </div>
          </div>
          <div className="flex flex-col px-4 space-y-2">
            {platformsMenu.map((platform) => {
              const isDisabled = platform !== 'Facebook';
              const isSelected = selectedPlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => {
                    if (!isDisabled) setSelectedPlatform(platform);
                  }}
                  disabled={isDisabled}
                  className={`relative px-4 border border-mountain-200 py-2 text-left rounded-lg transition-all w-full
                    ${isSelected ? 'bg-indigo-100 font-medium' : 'hover:bg-indigo-50 text-gray-700'}
                    ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  {platform}
                  {isDisabled && (
                    <span className="absolute text-sm text-gray-500 transform -translate-y-1/2 top-1/2 right-3">
                      Coming soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Accounts Panel */}
        <div className="flex flex-col w-3/4 h-full overflow-y-auto bg-white border border-mountain-200 rounded-3xl">
          <div className="z-50 flex items-center justify-between w-full h-20 p-4 shadow-md border-mountain-200 border-b-1 shrink-0">
            <div className="flex items-center space-x-2">
              <img src={fb_icon} className="size-10" />
              <div className="flex flex-col">
                <p className="text-sm font-semibold">
                  {selectedPlatform} Account
                </p>
                <span className="text-xs text-gray-500">
                  Manage your {selectedPlatform} accounts
                </span>
              </div>
            </div>
            <div className="relative flex items-center">
              <Button
                onClick={() => setDialogUserGuideOpen(!dialogUserGuideOpen)}
                className="flex items-center h-10 gap-2 px-4 font-medium border rounded-lg shadow-sm border-mountain-200 text-mountain-800"
              >
                <Newspaper className="size-4" />
                <p className="text-sm">User Guide</p>
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center w-full h-full p-4 pr-2 space-y-4 sidebar">
            {isLoading ? (
              <p>Loading accounts...</p>
            ) : facebookProfile ? (
              <>
                <div className="relative flex flex-col items-center justify-center w-full h-64 p-2 space-y-2 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 shrink-0">
                  <img
                    src={facebookProfile.profilePicture}
                    className="rounded-full size-24"
                    alt={`${facebookProfile.name}'s profile`}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xl font-medium text-indigo-600">
                      {facebookProfile.name}
                    </p>
                  </div>
                  <span className="text-sm">
                    {facebookPages.length} Facebook Page
                    {facebookPages.length !== 1 ? 's' : ''}
                  </span>
                  <div className="absolute flex items-center h-10 space-x-2 top-2 right-2">
                    <Button
                      title="Disconnect account is not implemented"
                      disabled
                      className="flex items-center justify-center h-full gap-2 px-4 py-2 font-normal bg-white rounded-lg shadow-md hover:brightness-105 text-mountain-950 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdLogout className="size-5" />
                    </Button>
                  </div>
                  <div className="absolute flex items-center h-10 space-x-2 right-2 bottom-2">
                    <div
                      onClick={() =>
                        !isConnecting && initiateFacebookConnection()
                      }
                      className={`flex items-center justify-center h-full px-2 space-x-2 bg-white rounded-lg shadow-md select-none w-fit text-mountain-800 ${isConnecting ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
                    >
                      <PiArrowsClockwise />
                      <span>
                        {isConnecting ? 'Redirecting...' : 'Reconnect'}
                      </span>
                    </div>
                  </div>
                </div>
                {facebookPages.length === 0 ? (
                  <p className="italic text-gray-500">
                    Your facebook account needs to have at least 1 page to
                    create the new post automation workflow.
                  </p>
                ) : (
                  facebookPages.map((page) => (
                    <div
                      key={page.id}
                      className="relative flex items-center w-full px-4 py-2 space-x-2 border border-gray-200 shadow-md rounded-xl"
                    >
                      <div className="flex items-center flex-1 gap-4 overflow-hidden">
                        <div className="flex items-center space-x-2 border-mountain-200 border-r-1 w-[30%] shrink-0">
                          <img
                            src={
                              page.picture_url || getPlatformIcon(page.name)!
                            }
                            className="object-cover rounded-full size-8"
                            alt={`${page.config.page_name}'s icon`}
                          />
                          <div className="flex flex-col">
                            <span className="text-base line-clamp-1">
                              {page.config.page_name}
                            </span>
                            <span className="text-xs text-mountain-600">
                              {toTitleCase(page.name)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {page.autoProjects?.length > 0 ? (
                            page.autoProjects.map((project) => (
                              <Link
                                key={project.id}
                                to={`/auto/projects/${project.id}/details`}
                                className="px-2.5 py-1 text-sm text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors shrink-0"
                              >
                                {project.title}
                              </Link>
                            ))
                          ) : (
                            <span className="text-sm italic text-gray-400">
                              Not used in any projects
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute flex items-center space-x-2 -translate-y-1/2 top-1/2 right-2">
                        {page.token_expires_at ? (
                          <div className="flex items-center h-10 px-4 space-x-2 text-sm border rounded-full select-none border-mountain-200 w-fit text-mountain-600">
                            <span>Expires at: </span>
                            <span>
                              {dayjs(page.token_expires_at).format(
                                'MMM D, YYYY',
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center h-10 px-4 space-x-2 text-sm text-green-700 border border-green-200 rounded-full select-none bg-green-50 w-fit">
                            <span>Never expires</span>
                          </div>
                        )}
                        <Button
                          onClick={() => handleDisconnect(page.id)}
                          title="Disconnect Page"
                          className="flex items-center justify-center h-10 px-2 rounded-lg cursor-pointer select-none bg-mountain-100/60 w-fit text-mountain-800"
                        >
                          <Trash2Icon className="size-5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-2 space-y-2 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 shrink-0">
                <p className="text-gray-500">No Facebook account connected</p>
                <Button
                  onClick={() => !isConnecting && initiateFacebookConnection()}
                  disabled={isConnecting}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:brightness-105 disabled:opacity-70"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Facebook Account'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(!dialogOpen)}>
        <DialogTitle className="flex items-center space-x-2">
          <p>Connect Social</p>
        </DialogTitle>
        <DialogContent className="flex p-4 space-x-8 bg-white h-fit">
          <div
            onClick={() => !isConnecting && initiateFacebookConnection()}
            className={`relative flex flex-col items-center justify-center duration-300 ease-in-out transform rounded-lg bg-indigo-50 w-36 h-36 hover:scale-105 ${isConnecting ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
          >
            <img src={fb_icon} className="size-10" />
            <p>Facebook</p>
            <span className="absolute text-xs bottom-2 text-mountain-400">
              {isConnecting ? 'Please wait...' : 'Click to connect'}
            </span>
          </div>
          <div className="relative flex flex-col items-center justify-center rounded-lg select-none bg-indigo-50 brightness-95 w-36 h-36">
            <img src={ins_icon} className="size-10" />
            <p>Instagram</p>
            <span className="absolute text-xs bottom-2 text-mountain-400">
              Coming soon
            </span>
          </div>
        </DialogContent>
      </Dialog>
      <UserGuide
        dialogUserGuideOpen={dialogUserGuideOpen}
        setDialogUserGuideOpen={setDialogUserGuideOpen}
      />
    </div>
  );
};

export default SocialLinksPage;
