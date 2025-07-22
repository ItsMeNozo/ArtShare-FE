export const CustomDateHeader = ({ label }: { date: Date; label: string }) => {
  return (
    <div className="flex justify-center items-center h-12 font-normal text-mountain-700 text-xs">
      {label}
    </div>
  );
};