import React, { useState } from 'react';
import { IoHome } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
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

type BackButtonProps = {
  hasChanges?: boolean;
};

const BackButton: React.FC<BackButtonProps> = ({ hasChanges }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const isNewEditorPage = location.pathname === "/image/tool/editor/new";
  const shouldConfirmBeforeLeave = hasChanges && !isNewEditorPage;
  return (
    <>
      <button
        onClick={(e) => {
          if (shouldConfirmBeforeLeave) {
            e.preventDefault();
            setShowConfirm(true);
          } else {
            navigate("/explore");
          }
        }}
        className="flex items-center bg-mountain-50 hover:bg-mountain-100/80 px-4 border border-mountain-100 rounded-lg h-10"
      >
        <div className="flex justify-center items-center hover:bg-mountain-100 mr-2 rounded-lg">
          <IoHome className="size-5 text-mountain-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex font-medium">Dashboard</span>
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
                navigate("/explore");
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
