//Core
import React, { useEffect, useState } from 'react';

//Icons
import { FiDownload } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

//Components
import { Button, CircularProgress, ImageList, ImageListItem, Tooltip } from '@mui/material';
import GenImage from './GenImage';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { RiShareBoxFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

interface promptResultProps {
    tempResult?: string[],
    tempPrompt?: string,
    result?: PromptResult,
    generating: boolean | null,
    useToShare?: boolean | null
}

const PromptResult: React.FC<promptResultProps> = ({
    tempResult,
    tempPrompt,
    result,
    generating,
    useToShare
}) => {
    const [open, setOpen] = useState(false);
    const handleDownloadAll = async () => {
        const zip = new JSZip();
        if (result)
            await Promise.all(
                result.image_urls.map(async (url, index) => {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    zip.file(`image-${index + 1}.jpg`, blob);
                })
            );

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'images.zip');
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (open) {
            timeout = setTimeout(() => {
                // onDelete?.(result?.id!); // Trigger delete --> RESOVLE THIS
                setOpen(false); // Close dialog after delete
            }, 2000);
        }

        return () => clearTimeout(timeout);
    }, [open]);

    const navigate = useNavigate();

    const handleNavigateToUploadPost = (prompt: PromptResult) => {
        navigate("/posts/new?type=ai-gen", { state: { prompt } });
    };

    if (generating === false) {
        return (
            <div className='flex flex-col space-y-2 w-full'>
                <div className='flex justify-between items-center space-x-2 w-full'>
                    <p className='line-clamp-1'><span className='mr-2 font-sans font-medium'>Prompt</span>{result?.user_prompt}</p>
                    <div className='flex items-center space-x-2'>
                        <Tooltip title="Share Post" placement='bottom' arrow>
                            <Button onClick={() => handleNavigateToUploadPost(result!)} className={`flex bg-mountain-100 ${useToShare ? 'w-36' : 'w-8'}`}>
                                <RiShareBoxFill className='size-5' />
                                <p className={`${!useToShare ? 'hidden' : 'ml-2 font-normal'}`}>Share These</p>
                            </Button>
                        </Tooltip>
                        <Tooltip title="Download" placement='bottom' arrow>
                            <Button className='bg-mountain-100' onClick={handleDownloadAll} hidden={useToShare || false}>
                                <FiDownload className='size-5' />
                            </Button>
                        </Tooltip>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Tooltip title="Delete" placement='bottom' arrow>
                                    <Button className='flex bg-mountain-100 w-4' hidden={useToShare || false}>
                                        <FiTrash2 className='size-5 text-red-900' />
                                    </Button>
                                </Tooltip>
                            </PopoverTrigger>
                            <PopoverContent className="dark:bg-mountain-900 mt-2 mr-6 p-2 border-mountain-100 dark:border-mountain-700 w-48">
                                <div className="flex flex-col space-y-2">
                                    <p className='text-sm'>Are you sure to delete?</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className='bg-mountain-100'>
                                                <FiTrash2 className='mr-2 size-5' />
                                                <p className='font-normal'>Delete All</p>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="flex justify-center sm:max-w-[320px] h-fit cursor-not-allowed" hideCloseButton>
                                            <DialogHeader>
                                                <DialogDescription className='flex justify-center items-center space-x-4'>
                                                    <CircularProgress size={32} thickness={4} />
                                                    <DialogTitle className='font-normal text-base text-center'>Deleting These Images</DialogTitle>
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                {result && (
                    <ImageList cols={4} gap={8} sx={{ width: '100%', minHeight: '268px' }}>
                        {result.image_urls.map((__, index) => (
                            <ImageListItem key={index} className='flex h-full object-cover'>
                                <GenImage
                                    result={result}
                                    otherImages={result.image_urls}
                                    index={index}
                                    useToShare={useToShare}
                                // onDelete={onDeleteSingle!}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                )}
            </div>
        )
    }
    return (
        <>
            {generating && (
                <div className='flex flex-col space-y-2 w-full'>
                    <div className='flex justify-between items-center space-x-2 w-full'>
                        <p className='line-clamp-1'><span className='font-sans font-medium'>Prompt</span>{" " + tempPrompt}</p>
                        <div className='flex items-center space-x-2 pointer-events-none'>
                            <Button className='flex bg-mountain-100 w-8' title='Share Post'>
                                <RiShareBoxFill className='size-5' />
                            </Button>
                            <Button className='flex bg-mountain-100 w-8' title='Download'>
                                <FiDownload className='size-5' />
                            </Button>
                            <Button className='flex bg-mountain-100 w-4'>
                                <FiTrash2 className='size-5 text-red-900' />
                            </Button>
                        </div>
                    </div>
                    {tempResult && (
                        <ImageList cols={4} gap={8} sx={{ width: '100%', minHeight: '268px' }}>
                            {tempResult.map(() => (
                                <ImageListItem className='flex h-full object-cover'>
                                    <div className='relative flex justify-center items-center bg-mountain-100 rounded-[8px] h-full'>
                                        <CircularProgress size={64} thickness={4} />
                                        <p className='absolute font-medium text-gray-700 text-xs'>Loading</p>
                                    </div>
                                </ImageListItem>
                            ))}
                        </ImageList>
                    )}
                </div>
            )}
        </>
    )
}

export default PromptResult