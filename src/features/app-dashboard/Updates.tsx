import { RiSettingsLine } from "react-icons/ri"
import changelog from './changelog.json'
import { PiStarFourFill } from "react-icons/pi";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

const Updates = () => {
  return (
    <div className="flex flex-col items-center space-y-8 py-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      <div className="flex flex-col justify-center items-center space-y-2 bg-gradient-to-r from-indigo-100 via-white to-purple-100 shadow-md p-2 px-12 rounded-full shrink-0">
        <p className="font-medium text-2xl">Latest Updates</p>
        <span className="text-mountain-600 text-sm">Discover the latest platform enhancements and announcements</span>
      </div>
      <div className="flex items-center space-x-4 py-4 shrink-0">
        <button className="flex justify-center items-center bg-mountain-900 px-4 border border-mountain-200 rounded-xl h-10 text-white text-sm">All</button>
        <button className="flex justify-center items-center px-4 text-sm">Announcement</button>
        <button className="flex justify-center items-center px-4 text-sm">Change log</button>
      </div>
      <div className="flex gap-8 h-fit">
        <div className="relative w-48">
          {changelog.map((entry, index) => (
            <div key={entry.id} className={`relative flex flex-col min-h-180 last:min-h-0`}>
              <div className="top-0 z-10 sticky flex justify-end items-center font-thin text-sm">
                {formatDate(entry.date)}
                <div className="flex justify-center items-center bg-purple-200 border-[#F2F4F7] border-6 rounded-full w-12 h-12">
                  <RiSettingsLine className="size-6 text-purple-700" />
                </div>
              </div>
              <div className="top-0 right-6 absolute flex flex-col items-center space-y-2 h-full">
                {index < changelog.length - 1 && (
                  <div className="flex flex-1 bg-mountain-200 w-[1px] h-full" />
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Right Content Area */}
        <div className="flex flex-col">
          {changelog.map((entry) => (
            <div key={entry.id} className="flex flex-col space-y-4 min-h-180 last:min-h-0">
              {entry.media?.map((media) =>
                media.type === 'image' ? (
                  <img
                    key={media.url}
                    src={media.url}
                    alt=""
                    className="shadow-md rounded-xl w-144 h-fit object-cover"
                  />
                ) : null
              )}
              <div className="flex flex-col justify-center items-start bg-white shadow-md p-4 rounded-lg w-144">
                <div className="flex justify-between items-center w-full">
                  <h2 className="font-medium text-lg">{entry.title}</h2>
                  <span className="text-mountain-400 text-sm">{entry.version}</span>
                </div>
                {entry.content.length > 0 && (
                  <ul className="space-y-2 py-1 text-gray-600 text-sm">
                    {entry.content.map((line, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <PiStarFourFill className="text-purple-900 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Updates