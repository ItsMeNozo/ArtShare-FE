import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import React, { useState } from 'react';
import { IoHome } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';

type BackButtonProps = {
  hasChanges?: boolean;
};

const BackButton: React.FC<BackButtonProps> = ({ hasChanges }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const isNewEditorPage = location.pathname === '/image/tool/editor/new';
  const shouldConfirmBeforeLeave = hasChanges && !isNewEditorPage;
  return (
    <>
      <button
        onClick={(e) => {
          if (shouldConfirmBeforeLeave) {
            e.preventDefault();
            setShowConfirm(true);
          } else {
            navigate('/explore');
          }
        }}
        className="bg-mountain-50 hover:bg-mountain-100/80 border-mountain-100 flex h-10 items-center rounded-lg border px-4"
      >
        <div className="hover:bg-mountain-100 mr-2 flex items-center justify-center rounded-lg">
          <IoHome className="text-mountain-600 size-5" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex font-medium">Home</span>
        </div>
      </button>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Leaving now will discard all your edits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirm(false);
                navigate('/explore');
              }}
            >
              Leave Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BackButton;
