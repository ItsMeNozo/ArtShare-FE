import React, { useState, ElementType, useEffect } from 'react'

//Libs
import ShowMoreText from "react-show-more-text";

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
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

//Assets
const example_1 = 'https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/Models-Mock/Model-1/dzu0q9a2zxvtu3w1r29a';

//Icons
import { IoIosSquareOutline } from "react-icons/io";
import { IoCopyOutline } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight, FaRegPenToSquare } from "react-icons/fa6";
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { FiDownload } from "react-icons/fi";
import { RiFolderUploadLine } from "react-icons/ri";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import DeleteButton from './DeleteConfirmation';

interface GenImageProps {
    index: number,
    result: PromptResult;
    otherImages: string[],
    // onDelete?: (resultId: number, imgId: number) => void;
}

const AnyShowMoreText: ElementType = ShowMoreText as unknown as ElementType;


const GenImage: React.FC<GenImageProps> = ({ index, result, otherImages }) => {
    const [deleteImage, setDeleteImage] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [openDiaLog, setOpenDiaLog] = useState(false);
    const navigate = useNavigate();

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + otherImages.length) % otherImages.length);
    };

    const handleNav = (index: number) => {
        if (index >= 0 && index < otherImages.length) {
            setCurrentIndex(index);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % otherImages.length);
    };

    const handleDownload = () => {
        const currentImageUrl = otherImages[currentIndex];
        const link = document.createElement('a');
        link.href = currentImageUrl;
        link.download = `image-${currentIndex + 1}.jpg`; // or use original file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleNavigateToEdit = () => {
        navigate("/image/tool/editor");
    }

    const handleNavigateToUpload = (prompt: PromptResult) => {
        navigate("/posts/new?type=ai-gen", { state: { prompt } });
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (open) {
            timeout = setTimeout(() => {
                // onDelete?.(result.id, result); --> RESOVLE HERE
                setOpen(false); // Close dialog after delete
                setOpenDiaLog(false);
            }, 2000);
        }

        return () => clearTimeout(timeout);
    }, [open]);

    const handleDelete = () => {
        setTimeout(() => {
            // onDelete?.(resultId, imageId); --> RESOVLE HERE
            setOpen(false);
            setDeleteImage(false);
        }, 2000);
    };

    return (
        <Dialog open={openDiaLog} onOpenChange={setOpenDiaLog}>
            <DialogTrigger asChild>
                <div className='group relative flex h-full'>
                    <div className='relative flex'>
                        <img
                            src={result.image_urls[index]}
                            alt={`Image ${result.id}`}
                            loading="lazy"
                            className='relative flex shadow-md h-full object-cover cursor-pointer'
                            style={{ borderRadius: '8px' }}
                            onClick={() => { setCurrentIndex(index), setOpenDiaLog(true) }}
                        />
                        {deleteImage === true && (
                            <div className='absolute flex justify-center items-center bg-black/20 w-full h-full'>
                                <div className='flex flex-col space-y-2 bg-white p-2 rounded-lg h-fit'>
                                    <p className='text-sm'>Are you sure to delete?</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className='bg-mountain-100' onClick={(e) => {
                                                e.stopPropagation(); // Prevent opening dialog
                                                handleDelete();
                                            }}>
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
                            </div>
                        )}
                    </div>
                    <div className='bottom-2 left-2 absolute flex'>
                        <Tooltip title="Download">
                            <div onClick={(e) => {
                                e.stopPropagation(); // Prevent opening dialog
                                handleDownload();
                            }}
                                className='z-50 flex justify-center items-center bg-white opacity-0 group-hover:opacity-100 rounded-full w-6 h-6 duration-300 ease-in-out hover:cursor-pointer transform'>
                                <FiDownload className='text-mountain-600' />
                            </div>
                        </Tooltip>
                    </div>
                    <div className='right-2 bottom-2 absolute flex space-x-2'>
                        <Tooltip title="Edit">
                            <div onClick={(e) => {
                                e.stopPropagation(); // Prevent opening dialog
                                handleNavigateToEdit();
                            }}
                                className='z-50 flex justify-center items-center bg-white opacity-0 group-hover:opacity-100 rounded-full w-6 h-6 duration-300 ease-in-out hover:cursor-pointer transform'>
                                <FaRegPenToSquare className='size-4 text-mountain-600' />
                            </div>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <div onClick={(e) => {
                                e.stopPropagation(); // Prevent opening dialog
                                setDeleteImage(true);
                            }}
                                className='z-50 flex justify-center items-center bg-white opacity-0 group-hover:opacity-100 rounded-full w-6 h-6 duration-300 ease-in-out hover:cursor-pointer transform'>
                                <FiTrash2 className='text-mountain-600' />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className='p-0 border-0 rounded-xl min-w-7xl'>
                <DialogHeader hidden>
                    <DialogTitle>Image Preview</DialogTitle>
                    <DialogDescription>Image Description</DialogDescription>
                </DialogHeader>
                <div className='relative flex h-[680px]'>
                    <div className='relative bg-mountain-100 rounded-l-xl w-[65%] h-[680px] overflow-hidden'>
                        {/* Image Slider */}
                        <div className="flex justify-center items-center w-full h-full">
                            <div
                                className="flex h-full transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${currentIndex * 100}%)`,
                                    width: `${otherImages.length * 100}%`,
                                }}
                            >
                                {otherImages.map((_img, index) => (
                                    <div key={index} className="flex flex-shrink-0 justify-center items-center w-full h-full">
                                        <img
                                            src={_img}
                                            alt={`Preview ${index}`}
                                            className="max-w-full max-h-[680px] object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={`${otherImages.length === 1 ? 'hidden' : 'flex'}`}>
                            {/* Left Arrow */}
                            <div
                                onClick={handlePrev}
                                className='top-1/2 left-4 z-50 absolute flex justify-center items-center bg-white hover:bg-mountain-50 rounded-full w-10 h-10 hover:scale-105 -translate-y-1/2 duration-300 ease-in-out cursor-pointer'
                            >
                                <FaChevronLeft />
                            </div>
                            {/* Right Arrow */}
                            <div
                                onClick={handleNext}
                                className={`top-1/2 right-4 z-50 absolute flex justify-center items-center bg-white hover:bg-mountain-50 rounded-full w-10 h-10 hover:scale-105 -translate-y-1/2 duration-300 ease-in-out cursor-pointer`}
                            >
                                <FaChevronRight />
                            </div>
                            {/* Gallery Navigating */}
                            <div
                                onClick={handleNext}
                                className='bottom-4 left-1/2 z-50 absolute flex justify-center items-center space-x-2 rounded-full -translate-x-1/2 -translate-y-1/2 duration-300 ease-in-out cursor-pointer transform'
                            >
                                <div className={`gap-2 flex`}>
                                    {otherImages.map((_, index) => {
                                        let navIndex;
                                        switch (index) {
                                            case 0:
                                                navIndex = 3; // last image
                                                break;
                                            case 1:
                                                navIndex = 0; // first
                                                break;
                                            case 2:
                                                navIndex = 1; // second
                                                break;
                                            case 3:
                                                navIndex = 2; // third
                                                break;
                                            default:
                                                navIndex = index;
                                        }
                                        return (
                                            <div
                                                key={index}
                                                className={`hover:bg-white hover:opacity-100 rounded-lg w-8 h-2 ${currentIndex === index
                                                    ? 'bg-white opacity-100'
                                                    : 'bg-mountain-200 opacity-50'
                                                    }`}
                                                onClick={() => handleNav(navIndex)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col justify-between w-[35%] h-full'>
                        <div>
                            <div className='flex justify-between items-end p-4 border-mountain-100 border-b w-full h-28'>
                                <div className='flex justify-between items-center w-full'>
                                    <div className='flex items-center space-x-2'>
                                        <Avatar className='size-12'>
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <p className='font-medium'>Nguyễn Minh Thông</p>
                                    </div>
                                    <div className='flex'>
                                        <Button title='Download' onClick={handleDownload}>
                                            <FiDownload className='size-5' />
                                        </Button>
                                        <DeleteButton open={open} setOpen={setOpen} />
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col space-y-2 px-4 py-2 border-mountain-100 border-b w-full h-1/2'>
                                <div className='flex justify-between items-center w-full'>
                                    <p className='font-medium'>Prompt</p>
                                    <Button title='Copy' className='bg-mountain-100'>
                                        <IoCopyOutline className='size-5' />
                                    </Button>
                                </div>
                                <div className='flex w-full h-40 overflow-y-auto custom-scrollbar'>
                                    <AnyShowMoreText
                                        lines={3}
                                        more="Show more"
                                        less="Show less"
                                        className="flex w-full text-sm break-words"
                                        anchorClass="cursor-pointer hover:text-indigo-400 block py-2 underline text-sm"
                                        expanded={false}
                                        truncatedEndingComponent={"... "}
                                    >
                                        {result.user_prompt.replace(/\n/g, ' ')}
                                    </AnyShowMoreText>
                                </div>
                            </div>
                            <div className='flex p-4 w-full'>
                                <div className='flex flex-col space-y-2 w-1/3'>
                                    <p className='font-medium'>Style</p>
                                    <div className='flex items-center space-x-2'>
                                        <img src={example_1} className='rounded-xs w-5 h-5' />
                                        <p className='text-mountain-600 capitalize line-clamp-1'>{result.style}</p>
                                    </div>
                                </div>
                                <div className='flex flex-col space-y-2 w-1/3'>
                                    <p className='font-medium'>Aspect Ratio</p>
                                    <div className='flex items-center space-x-2'>
                                        <IoIosSquareOutline className='size-5' />
                                        <p className='text-mountain-600'>{result.aspect_ratio.charAt(0).toUpperCase() + result.aspect_ratio.slice(1).toLowerCase()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className='flex px-4 w-full'>
                                <div className='flex flex-col space-y-2 w-1/3'>
                                    <div className='flex justify-between items-center w-full'>
                                        <p className='font-medium'>Lighting</p>
                                    </div>
                                    <div className='flex items-center'>
                                        <p className='text-mountain-600 capitalize'>{result.lighting}</p>
                                    </div>
                                </div>
                                <div className='flex flex-col space-y-2 w-1/3'>
                                    <p className='font-medium'>Camera</p>
                                    <div className='flex text'>
                                        <p className='text-mountain-600 capitalize'>{result.camera}</p>
                                    </div>
                                </div>
                                <div className='flex flex-col space-y-2 w-1/3'>
                                    <p className='w-full font-medium'>Image Size</p>
                                    <div className='flex items-center'>
                                        <p className='text-mountain-600 capitalize'>1024x1024</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='p-2'>
                            <div onClick={() => handleNavigateToUpload(result)} className='flex justify-center items-center bg-indigo-100 hover:bg-indigo-200/80 shadow-sm border border-mountain-300 rounded-lg w-full h-12 font-normal duration-300 ease-in-out hover:cursor-pointer select-none transform'>
                                <RiFolderUploadLine className='mr-2 size-5' />
                                <p>Post This Image</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default GenImage