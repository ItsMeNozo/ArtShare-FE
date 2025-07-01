import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Newspaper } from 'lucide-react';

interface UserGuideProps {
  dialogUserGuideOpen: boolean;
  setDialogUserGuideOpen: (open: boolean) => void;
}

const UserGuide: React.FC<UserGuideProps> = ({
  dialogUserGuideOpen,
  setDialogUserGuideOpen,
}) => {
  return (
    <Dialog open={dialogUserGuideOpen} onClose={() => setDialogUserGuideOpen(!dialogUserGuideOpen)}>
      <DialogTitle className="flex items-center bg-mountain-50 border-mountain-200 border-b-1">
        <Newspaper className="mr-2 size-6" />
        <p>User Guide</p>
      </DialogTitle>
      <DialogContent className="flex space-x-8 bg-white p-4 h-fit">
        <div className="flex flex-col space-y-4">
          <p className="text-gray-700">
            1. This page allows you to manage your social media accounts. You can connect new platforms, view connected accounts, and manage posts.
          </p>
          <p className="text-gray-700">
            2. To connect a new platform, click on the "Connect Platform" button and select the desired platform.
          </p>
          <p className="text-gray-700">
            3. You can view the status of your connected accounts, including the number of posts and expiration date.
          </p>
          <p className='font-medium'>Precondition: <span>Your facebook account must have at least one facebook page</span>.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserGuide