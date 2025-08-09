import { toTitleCase } from '@/utils/common';
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
} from '@mui/material';
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      queryClient.invalidateQueries({ queryKey: ['facebookAccountInfo'] });

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
  const MAX_VISIBLE_PROJECTS = 2;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center gap-4 p-4">
      <div className="flex h-full w-full gap-4">
        <div className="border-mountain-200 flex h-full w-1/4 flex-col gap-2 space-y-2 rounded-3xl border bg-white">
          <div className="border-mountain-200 flex h-20 w-full items-center border-b-1 p-2">
            <div
              onClick={() => setDialogOpen(!dialogOpen)}
              className="border-mountain-200 text-mountain-900 flex h-full w-full transform cursor-pointer items-center justify-center gap-2 rounded-xl border bg-indigo-200 p-2 hover:brightness-105"
            >
              <Plus />
              <p>Connect Platform</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 px-4">
            {platformsMenu.map((platform) => {
              const isDisabled = platform !== 'Facebook';
              const isSelected =
                selectedPlatform.toLowerCase() === platform.toLowerCase();
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
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 transform text-sm text-gray-500">
                      Coming soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-mountain-200 flex h-full w-3/4 flex-col overflow-y-auto rounded-3xl border bg-white">
          <div className="border-mountain-200 z-50 flex h-20 w-full shrink-0 items-center justify-between border-b-1 p-4 shadow-md">
            <div className="flex items-center space-x-2">
              <img src={fb_icon} className="size-10" />
              <div className="flex flex-col">
                <p className="text-sm font-semibold">
                  {toTitleCase(selectedPlatform)} Account
                </p>
                <span className="text-xs text-gray-500">
                  Manage your {toTitleCase(selectedPlatform)} accounts
                </span>
              </div>
            </div>
            <div className="relative flex items-center">
              <Button
                onClick={() => setDialogUserGuideOpen(!dialogUserGuideOpen)}
                className="border-mountain-200 text-mountain-800 flex h-10 items-center gap-2 rounded-lg border px-4 font-medium shadow-sm"
              >
                <Newspaper className="size-4" />
                <p className="text-sm">User Guide</p>
              </Button>
            </div>
          </div>
          <div className="custom-scrollbar flex h-full w-full flex-col items-center space-y-4 p-4">
            {isLoading ? (
              <p>Loading accounts...</p>
            ) : facebookProfile ? (
              <>
                <div className="relative flex h-64 w-full shrink-0 flex-col items-center justify-center space-y-2 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 p-2">
                  <img
                    src={facebookProfile.profilePicture}
                    className="size-24 rounded-full"
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
                  <div className="absolute top-2 right-2 flex h-10 items-center space-x-2">
                    <Button
                      title="Disconnect account is not implemented"
                      disabled
                      className="text-mountain-950 flex h-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 font-normal shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdLogout className="size-5" />
                    </Button>
                  </div>
                  <div className="absolute right-2 bottom-2 flex h-10 items-center space-x-2">
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
                      className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-2 shadow-md"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="border-mountain-200 flex w-[30%] shrink-0 items-center space-x-2 border-r pr-4">
                          <img
                            src={page.pictureUrl || getPlatformIcon(page.name)!}
                            className="size-8 shrink-0 rounded-full object-cover"
                            alt={`${page.config.pageName}'s icon`}
                          />

                          <div className="flex min-w-0 flex-col">
                            <Tooltip title={page.config.pageName} arrow>
                              <span className="truncate text-base font-medium">
                                {page.config.pageName}
                              </span>
                            </Tooltip>
                            <span className="text-mountain-600 text-xs">
                              {toTitleCase(page.name)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-wrap items-center gap-2">
                          {page.autoProjects?.length > 0 ? (
                            <>
                              {page.autoProjects
                                .slice(0, MAX_VISIBLE_PROJECTS)
                                .map((project) => (
                                  <Tooltip
                                    key={project.id}
                                    title={project.title}
                                    arrow
                                  >
                                    <Link
                                      to={`/auto/projects/${project.id}/details`}
                                      className="block max-w-[200px] shrink-0 truncate rounded-full bg-indigo-100 px-2.5 py-1 text-sm text-indigo-700 transition-colors hover:bg-indigo-200"
                                    >
                                      {project.title}
                                    </Link>
                                  </Tooltip>
                                ))}
                              {page.autoProjects.length >
                                MAX_VISIBLE_PROJECTS && (
                                <Tooltip
                                  title={
                                    <div style={{ whiteSpace: 'pre-line' }}>
                                      {page.autoProjects
                                        .slice(MAX_VISIBLE_PROJECTS)
                                        .map((p) => p.title)
                                        .join('\n')}
                                    </div>
                                  }
                                  arrow
                                >
                                  <Chip
                                    label={`+${page.autoProjects.length - MAX_VISIBLE_PROJECTS}`}
                                    size="small"
                                    className="cursor-pointer"
                                  />
                                </Tooltip>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Not used in any projects
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center space-x-2">
                        {page.tokenExpiresAt ? (
                          <div className="border-mountain-200 text-mountain-600 flex h-10 w-fit items-center space-x-2 rounded-full border px-4 text-sm select-none">
                            <span>Expires at: </span>
                            <span>
                              {dayjs(page.tokenExpiresAt).format('MMM D, YYYY')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-10 w-fit items-center space-x-2 rounded-full border border-green-200 bg-green-50 px-4 text-sm text-green-700 select-none">
                            <span>Never expires</span>
                          </div>
                        )}
                        <Button
                          onClick={() => handleDisconnect(page.id)}
                          title="Disconnect Page"
                          className="bg-mountain-100/60 text-mountain-800 flex h-10 w-fit cursor-pointer items-center justify-center rounded-lg px-2 select-none"
                        >
                          <Trash2Icon className="size-5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div className="flex h-full w-full shrink-0 flex-col items-center justify-center space-y-2 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 p-2">
                <p className="text-gray-500">No Facebook account connected</p>
                <Button
                  onClick={() => !isConnecting && initiateFacebookConnection()}
                  disabled={isConnecting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:brightness-105 disabled:opacity-70"
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
        <DialogContent className="flex h-fit space-x-8 bg-white p-4">
          <div
            onClick={() => !isConnecting && initiateFacebookConnection()}
            className={`relative flex h-36 w-36 transform flex-col items-center justify-center rounded-lg bg-indigo-50 duration-300 ease-in-out hover:scale-105 ${isConnecting ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
          >
            <img src={fb_icon} className="size-10" />
            <p>Facebook</p>
            <span className="text-mountain-400 absolute bottom-2 text-xs">
              {isConnecting ? 'Please wait...' : 'Click to connect'}
            </span>
          </div>
          <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-lg bg-indigo-50 brightness-95 select-none">
            <img src={ins_icon} className="size-10" />
            <p>Instagram</p>
            <span className="text-mountain-400 absolute bottom-2 text-xs">
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
