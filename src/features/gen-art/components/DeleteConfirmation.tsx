import React, { Dispatch, SetStateAction } from 'react'

//Components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button, CircularProgress } from '@mui/material';

//Icons
import { FiTrash2 } from "react-icons/fi";

interface DeleteConfirmationProps {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const DeleteButton: React.FC<DeleteConfirmationProps> = ({ open, setOpen }) => {
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button className='flex w-4'>
                    <FiTrash2 className='size-5' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="dark:bg-mountain-900 mt-2 mr-6 p-2 border-mountain-100 dark:border-mountain-700 w-48">
                <div className="flex flex-col space-y-2">
                    <p className='text-sm'>Are you sure to delete?</p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className='bg-mountain-100'>
                                <FiTrash2 className='mr-2 size-5' />
                                <p className='font-normal'>Delete This</p>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="flex justify-center sm:max-w-[320px] h-fit cursor-not-allowed" hideCloseButton>
                            <DialogHeader>
                                <DialogDescription className='flex justify-center items-center space-x-4'>
                                    <CircularProgress size={32} thickness={4} />
                                    <DialogTitle className='font-normal text-base text-center'>Deleting This Image</DialogTitle>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default DeleteButton