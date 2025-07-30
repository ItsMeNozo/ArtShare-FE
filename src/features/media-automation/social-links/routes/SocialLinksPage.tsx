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
  const [selectedPlatform, setSelectedPlatform] = useState<string>('FACEBOOK');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogUserGuideOpen, setDialogUserGuideOpen] =
    useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data: platforms, isLoading: isLoadingPlatforms } =
    useFetchPlatforms(selectedPlatform);
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
          fbAccountInfo[0].pictureUrl || 'https://i.pravatar.cc/150',
      }
      : null;
  console.log('platforms', platforms);
  const facebookPages = platforms?.filter((p) => p.name === 'FACEBOOK') ?? [];
  console.log('facebookPages', facebookPages);
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
      <div className="flex gap-4 w-full h-full">
        {/* Filter Panel */}
        <div className="flex flex-col gap-2 space-y-2 bg-white border border-mountain-200 rounded-3xl w-1/4 h-full">
          <div className="flex items-center p-2 border-mountain-200 border-b-1 w-full h-20">
            <div
              onClick={() => setDialogOpen(!dialogOpen)}
              className="flex justify-center items-center gap-2 bg-indigo-200 hover:brightness-105 p-2 border border-mountain-200 rounded-xl w-full h-full text-mountain-900 cursor-pointer transform"
            >
              <Plus />
              <p>Connect Platform</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 px-4">
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
                  className={`border-mountain-200 relative w-full rounded-lg border px-4 py-2 text-left transition-all ${isSelected ? 'bg-indigo-100 font-medium' : 'text-gray-700 hover:bg-indigo-50'} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} `}
                >
                  {platform}
                  {isDisabled && (
                    <span className="top-1/2 right-3 absolute text-gray-500 text-sm -translate-y-1/2 transform">
                      Coming soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Accounts Panel */}
        <div className="flex flex-col bg-white border border-mountain-200 rounded-3xl w-3/4 h-full overflow-y-auto">
          <div className="z-50 flex justify-between items-center shadow-md p-4 border-mountain-200 border-b-1 w-full h-20 shrink-0">
            <div className="flex items-center space-x-2">
              <img src={fb_icon} className="size-10" />
              <div className="flex flex-col">
                <p className="font-semibold text-sm">
                  {toTitleCase(selectedPlatform)} Account
                </p>
                <span className="text-gray-500 text-xs">
                  Manage your {toTitleCase(selectedPlatform)} accounts
                </span>
              </div>
            </div>
            <div className="relative flex items-center">
              <Button
                onClick={() => setDialogUserGuideOpen(!dialogUserGuideOpen)}
                className="flex items-center gap-2 shadow-sm px-4 border border-mountain-200 rounded-lg h-10 font-medium text-mountain-800"
              >
                <Newspaper className="size-4" />
                <p className="text-sm">User Guide</p>
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 p-4 w-full h-full custom-scrollbar">
            {isLoading ? (
              <p>Loading accounts...</p>
            ) : facebookProfile ? (
              <>
                <div className="relative flex flex-col justify-center items-center space-y-2 bg-gradient-to-r from-indigo-50 to-indigo-100 p-2 rounded-lg w-full h-64 shrink-0">
                  <img
                    src={facebookProfile.profilePicture}
                    className="rounded-full size-24"
                    alt={`${facebookProfile.name}'s profile`}
                  />
                  <div className="flex flex-col justify-center items-center">
                    <p className="font-medium text-indigo-600 text-xl">
                      {facebookProfile.name}
                    </p>
                  </div>
                  <span className="text-sm">
                    {facebookPages.length} Facebook Page
                    {facebookPages.length !== 1 ? 's' : ''}
                  </span>
                  <div className="top-2 right-2 absolute flex items-center space-x-2 h-10">
                    <Button
                      title="Disconnect account is not implemented"
                      disabled
                      className="flex justify-center items-center gap-2 bg-white disabled:opacity-50 shadow-md hover:brightness-105 px-4 py-2 rounded-lg h-full font-normal text-mountain-950 disabled:cursor-not-allowed"
                    >
                      <MdLogout className="size-5" />
                    </Button>
                  </div>
                  <div className="right-2 bottom-2 absolute flex items-center space-x-2 h-10">
                    <div
                      onClick={() =>
                        !isConnecting && initiateFacebookConnection()
                      }
                      className={`text-mountain-800 flex h-full w-fit items-center justify-center space-x-2 rounded-lg bg-white px-2 shadow-md select-none ${isConnecting ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
                    >
                      <PiArrowsClockwise />
                      <span>
                        {isConnecting ? 'Redirecting...' : 'Reconnect'}
                      </span>
                    </div>
                  </div>
                </div>
                {facebookPages.length === 0 ? (
                  <p className="text-gray-500 italic">
                    Your facebook account needs to have at least 1 page to
                    create the new post automation workflow.
                  </p>
                ) : (
                  facebookPages.map((page) => (
                    <div
                      key={page.id}
                      className="relative flex items-center space-x-2 shadow-md px-4 py-2 border border-gray-200 rounded-xl w-full"
                    >
                      <div className="flex flex-1 items-center gap-4 overflow-hidden">
                        <div className="flex items-center space-x-2 border-mountain-200 border-r-1 w-[30%] shrink-0">
                          <img
                            src={page.pictureUrl || getPlatformIcon(page.name)!}
                            className="rounded-full size-8 object-cover"
                            alt={`${page.config.pageName}'s icon`}
                          />
                          <div className="flex flex-col">
                            <span className="text-base line-clamp-1">
                              {page.config.pageName}
                            </span>
                            <span className="text-mountain-600 text-xs">
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
                                className="bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-full text-indigo-700 text-sm transition-colors shrink-0"
                              >
                                {project.title}
                              </Link>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              Not used in any projects
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="top-1/2 right-2 absolute flex items-center space-x-2 -translate-y-1/2">
                        {page.tokenExpiresAt ? (
                          <div className="flex items-center space-x-2 px-4 border border-mountain-200 rounded-full w-fit h-10 text-mountain-600 text-sm select-none">
                            <span>Expires at: </span>
                            <span>
                              {dayjs(page.tokenExpiresAt).format('MMM D, YYYY')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 bg-green-50 px-4 border border-green-200 rounded-full w-fit h-10 text-green-700 text-sm select-none">
                            <span>Never expires</span>
                          </div>
                        )}
                        <Button
                          onClick={() => handleDisconnect(page.id)}
                          title="Disconnect Page"
                          className="flex justify-center items-center bg-mountain-100/60 px-2 rounded-lg w-fit h-10 text-mountain-800 cursor-pointer select-none"
                        >
                          <Trash2Icon className="size-5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div className="flex flex-col justify-center items-center space-y-2 bg-gradient-to-r from-indigo-50 to-indigo-100 p-2 rounded-lg w-full h-full shrink-0">
                <p className="text-gray-500">No Facebook account connected</p>
                <Button
                  onClick={() => !isConnecting && initiateFacebookConnection()}
                  disabled={isConnecting}
                  className="bg-blue-600 disabled:opacity-70 hover:brightness-105 px-4 py-2 rounded-lg text-white"
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
        <DialogContent className="flex space-x-8 bg-white p-4 h-fit">
          <div
            onClick={() => !isConnecting && initiateFacebookConnection()}
            className={`relative flex h-36 w-36 transform flex-col items-center justify-center rounded-lg bg-indigo-50 duration-300 ease-in-out hover:scale-105 ${isConnecting ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
          >
            <img src={fb_icon} className="size-10" />
            <p>Facebook</p>
            <span className="bottom-2 absolute text-mountain-400 text-xs">
              {isConnecting ? 'Please wait...' : 'Click to connect'}
            </span>
          </div>
          <div className="relative flex flex-col justify-center items-center bg-indigo-50 brightness-95 rounded-lg w-36 h-36 select-none">
            <img src={ins_icon} className="size-10" />
            <p>Instagram</p>
            <span className="bottom-2 absolute text-mountain-400 text-xs">
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
