export const CustomDateHeader = ({ label }: { label: string; date: Date }) => {
  return (
    <div className="p-2 font-normal text-mountain-700 text-xs">
      <span>{label}</span>
    </div>
  );
};

export const CustomDateMonthHeader = ({ date }: { label?: string; date: Date }) => {
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div className="relative flex justify-end items-start p-1 font-normal text-xs text-right">
      <span
        className={`size-5 flex items-center justify-center ${isToday ? 'text-white bg-blue-600 rounded-full' : ''
          }`}
      >
        {date.getDate()}
      </span>
    </div>
  );
};

