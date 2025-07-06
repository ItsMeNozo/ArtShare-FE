import { BiExpandAlt } from 'react-icons/bi'

const ToggleFullScreen = () => {
  return (
    <div className='top-2 -right-14 absolute flex flex-col justify-center items-center space-y-1 bg-white opacity-50 hover:opacity-100 p-1 border border-mountain-200 rounded-xl w-12 h-12 duration-200 ease-in-out cursor-pointer transform'>
      <BiExpandAlt />
    </div>
  )
}

export default ToggleFullScreen