import React, { useState } from 'react';
import { GoShare } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type ShareButtonProps = {
  hasChanges?: boolean;
  handleShare?: () => void;
};

const ShareButton: React.FC<ShareButtonProps> = ({ handleShare, hasChanges }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          if (hasChanges) {
            e.preventDefault();
            setShowConfirm(true);
          } else {
            handleShare?.();
          }
        }}
        className="flex justify-center items-center space-x-2 bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer"
      >
        <GoShare className="size-4 text-indigo-600" />
        <p className="font-medium">Share</p>
      </button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className='border-mountain-200'>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-indigo-900">
              <GoShare className="size-6" />
              <p>Share Your Great Image</p>
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-gray-700 text-sm">
              You are about to share this image by uploading post.
              Unfortunately, this app <strong>does not support</strong> saving changes made during editing.
              <br />
              <br />
              Make sure that your image is ready to share now!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirm(false);
                navigate("/explore");
              }}
              className="bg-indigo-900 hover:bg-indigo-800 text-white"
            >
              I'm sure for that
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShareButton;
