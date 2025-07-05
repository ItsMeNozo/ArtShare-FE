
//Compoents
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@mui/material'

//Icons
import { IoIosArrowForward } from 'react-icons/io'
import { aspectOptions } from "../../enum"

const AspectRatioOptions: React.FC<SelectRatioProp> = ({ selectedAspect, onChange }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className='flex justify-between bg-mountain-100 p-3 rounded-xl w-full font-normal'>
                    <div className='flex items-center space-x-2'>
                        <selectedAspect.icon className="size-5 text-mountain-600" />
                        <p>{selectedAspect.label}</p>
                    </div>
                    <IoIosArrowForward />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='-top-13 left-40 absolute shadow-xl p-0 border-mountain-300'>
                <div className="p-2 border-mountain-300 border-b">
                    <p>Aspect Ratio</p>
                </div>
                <div className="flex justify-between space-x-2 px-6 py-4">
                    {aspectOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <div
                                key={option.value}
                                className={`flex flex-col justify-center space-y-2 items-center cursor-pointer}`}
                                onClick={() => onChange(option)}
                            >
                                <div className={`flex justify-center items-center bg-mountain-100 rounded-lg w-14 h-14 ${selectedAspect.value === option.value ? 'ring-2 ring-mountain-400 rounded-lg' : ''}`}>
                                    <Icon className="size-5 text-mountain-600" />
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

export default AspectRatioOptions