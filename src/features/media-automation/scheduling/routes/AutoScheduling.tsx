import { format } from 'date-fns';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CustomEvent from '../components/CustomEvent';
import {
  CustomDateMonthHeader,
  CustomDateHeader as CustomMonthHeader,
} from '../components/CustomMonthHeader';
import { CustomDateHeader as CustomWeekHeader } from '../components/CustomWeekHeader';
import '../style.css';
import { Post, PostStatus } from '../types/PostTypes';
import { transformDataToEvents } from '../utils/TransformDataToEvent';

// Mock data based on your provided structure
const mockProjects = [
  {
    id: 12,
    title: 'test test',
    status: 'ACTIVE',
    platform: {
      id: 16,
      name: 'FACEBOOK',
    },
    postCount: 2,
    nextPostAt: null,
  },
];

const mockPosts: Post[] = [
  {
    id: 13,
    autoProjectId: 12,
    content:
      'In your free time, do you prefer to enjoy some solitude or to hang out with friends? Both options have their own charm...',
    scheduledAt: '2025-07-21T10:00:00.000Z', // Example future date
    status: PostStatus.PENDING,
  },
  {
    id: 12,
    autoProjectId: 12,
    content:
      "There's something truly comforting about sleep—it's where we continue to exist beyond the chaos of the day...",
    scheduledAt: '2025-07-19T13:00:00.000Z',
    status: PostStatus.POSTED,
  },
];

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const AutoScheduling = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const formattedEvents = transformDataToEvents(mockProjects, mockPosts);
    setEvents(formattedEvents);
  }, []);

  return (
    <div className="border-mountain-200 flex h-[calc(100vh-4rem)] w-full gap-2 overflow-y-auto rounded-t-3xl bg-white p-4 text-sm">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="custom-scrollbar h-full w-full rounded-lg"
        tooltipAccessor={null}
        components={{
          month: {
            header: CustomMonthHeader,
            dateHeader: CustomDateMonthHeader,
          },
          week: {
            header: CustomWeekHeader,
          },
          event: CustomEvent,
        }}
        eventPropGetter={() => {
          const backgroundColor = 'white';
          return {
            style: {
              backgroundColor,
              color: 'black',
              borderRadius: '0.5rem',
              boxShadow:
                '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              padding: '2px 4px',
              border: '1px solid #d1d1d1',
            },
          };
        }}
      />
      {/* <div className='flex bg-black w-80 h-full'>
        TODO
      </div> */}
    </div>
  );
};

export default AutoScheduling;
