
//Compoents
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@mui/material'

//Icons
import { IoIosArrowForward } from 'react-icons/io'
import { cameraOptions } from "../../enum"
import { AiOutlineCamera } from "react-icons/ai";

const CameraOptions: React.FC<SelectCameraProp> = ({ selectedCamera, onChange }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className='flex justify-between bg-mountain-100 p-3 rounded-xl w-full font-normal'>
                    <div className='flex items-center space-x-2'>
                        <AiOutlineCamera className='rounded-xs w-5 h-5' />
                        <p>{selectedCamera.label}</p>
                    </div>
                    <IoIosArrowForward />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='-top-33 left-40 absolute flex flex-col shadow-xl p-0 border-mountain-300'>
                <div className="p-2 border-mountain-300 border-b">
                    <p>Image Camera/Vision</p>
                </div>
                <div className="flex flex-col justify-between space-y-2 px-6 py-4 h-48 overflow-y-auto custom-scrollbar">
                    {cameraOptions.map((option) => {
                        return (
                            <div
                                key={option.value}
                                className={`flex flex-col justify-center w-full space-y-2 items-center cursor-pointer}`}
                                onClick={() => onChange(option)}
                            >
                                <div className={`flex justify-center items-center w-full bg-mountain-100 rounded-lg h-14 ${selectedCamera.value === option.value ? 'ring-2 ring-indigo-400 rounded-lg' : ''}`}>
                                    <img src={option.exampleUrl} loading="lazy" className="rounded-lg w-full h-full size-5 object-cover text-mountain-600" />
                                </div>
                                <p className="text-mountain-800 text-xs">{option.label}</p>
                            </div>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default CameraOptions;