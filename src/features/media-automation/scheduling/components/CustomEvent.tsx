import { EventProps } from 'react-big-calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const CustomEvent = ({ event }: EventProps) => {
  const { title, resource } = event;
  const { status, content, platform } = resource;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-0.5 p-0.5 cursor-pointer">
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status)}`} />
            <strong className="text-sm truncate">{title}</strong>
          </div>
          <p className="text-mountain-600 text-xs">Platform: {platform}</p>
          <p className="text-mountain-900 text-xs truncate">{content}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent side='top' className="space-y-1 bg-white shadow-lg mb-2 p-2 border border-mountain-200 rounded-lg w-44 h-48 text-sm text-left">
        <p className="font-semibold">{title}</p>
        <p className="text-gray-600">Platform: {platform}</p>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
          <span className="text-gray-500 text-xs">{status}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default CustomEvent;
