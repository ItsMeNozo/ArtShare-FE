import { FaArrowRightLong } from 'react-icons/fa6';
import { IoNewspaperOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

import { MdOutlineExplore } from 'react-icons/md';
import RecentPost from './components/RecentPost';
// import RecentBlog from './components/RecentBlog';

import { dashboardBG, featuresShowcase } from '@/utils/constants';
import RecentBlog from './components/RecentBlog';

const Dashboard = () => {
  return (
    <div
      className="sidebar flex h-screen flex-col space-y-4 overflow-x-hidden p-4"
      data-testid="dashboard-content"
    >
      {/* Hero section */}
      <div className="relative flex h-96 w-full items-center rounded-xl p-4">
        {/* Gradient background */}
        <div className="animate-gradient absolute inset-0 rounded-xl bg-gradient-to-br from-blue-800/60 via-indigo-800/60 to-purple-800/60 bg-[length:100%_100%]" />
        {/* Blurred lighting effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-40 h-80 w-80 rounded-full bg-white/80 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-indigo-200 blur-3xl" />
        </div>
        {/* Text section */}
        <div className="z-10 flex flex-1 flex-col space-y-8">
          <div className="flex flex-col space-y-1 select-none">
            <p className="text-5xl font-bold text-white">
              Welcome to Art Share
            </p>
            <p className="text-mountain-100 text-lg">
              Your Smart Content Creator
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="updates"
              className="bg-mountain-950 flex w-40 items-center justify-center space-x-2 rounded-xl p-4 text-white transition duration-300 ease-in-out hover:scale-105 hover:cursor-pointer hover:brightness-105"
            >
              <p className="font-bold select-none">Version 1.52</p>
            </Link>
            <Link
              to="updates"
              className="border-mountain-200 text-mountain-950 flex w-40 items-center justify-center space-x-2 rounded-xl border bg-gradient-to-r from-indigo-100 to-purple-50 p-4 transition duration-300 ease-in-out hover:scale-105 hover:cursor-pointer hover:brightness-105"
            >
              <IoNewspaperOutline />
              <p className="font-thin select-none">What's new</p>
            </Link>
          </div>
        </div>
        {/* Image section */}
        <img
          src={dashboardBG}
          alt="dashboard-bg"
          className="z-10 mt-8 h-[600px] scale-x-[-1] rounded-xl object-cover"
        />
      </div>
      {/* Current features */}
      <div className="mt-2 flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <p className="text-mountain-950 font-sans text-2xl font-semibold">
            All-in-One Creator Tools
          </p>
          <p className="text-mountain-600">
            AI-powered tools for content creation made easy
          </p>
        </div>
        <div className="grid grid-cols-4 gap-x-4">
          {featuresShowcase.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="group border-mountain-200 relative flex h-86 w-72 flex-col rounded-xl border bg-white shadow-md"
            >
              <div className="flex flex-col">
                <div className="flex h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={feature.url}
                    className="flex w-full transform rounded-t-xl object-cover duration-300 ease-in-out group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col space-y-2 p-2">
                  <p className="line-clamp-1 text-lg font-medium">
                    {feature.label}
                  </p>
                  <p className="text-mountain-600 line-clamp-2 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
              <Link
                to="/image/tool/text-to-image"
                className="bg-mountain-100 text-mountain-950 absolute right-2 bottom-2 flex transform items-center space-x-2 rounded-lg px-4 py-2 duration-300 ease-in-out hover:brightness-105"
              >
                <p>Explore</p>
                <FaArrowRightLong />
              </Link>
            </div>
          ))}
        </div>
      </div>
      {/* What's new */}
      <div className="mt-2 flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <p className="text-mountain-950 font-sans text-2xl font-semibold">
            Discover What's New
          </p>
          <p className="text-mountain-600">
            Planning content generation and automate publishing across platforms{' '}
            <Link to="/dashboard/updates" className="underline">
              version 1.52
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-4 gap-x-4">
          {featuresShowcase.slice(3, 7).map((feature, index) => (
            <div
              key={index}
              className="group border-mountain-200 relative flex h-86 w-72 flex-col rounded-xl border bg-white shadow-md"
            >
              <div className="flex flex-col">
                <div className="flex h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={feature.url}
                    className="flex transform rounded-t-xl object-cover opacity-90 brightness-85 duration-300 ease-in-out group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col space-y-2 p-2">
                  <p className="line-clamp-1 text-lg font-medium">
                    {feature.label}
                  </p>
                  <p className="text-mountain-600 line-clamp-2 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
              <Link
                to={feature.destination}
                className="bg-mountain-100 text-mountain-950 absolute right-2 bottom-2 flex transform items-center space-x-2 rounded-lg px-4 py-2 duration-300 ease-in-out hover:brightness-105"
              >
                <p>Explore</p>
                <FaArrowRightLong />
              </Link>
            </div>
          ))}
        </div>
      </div>
      <hr className="border-mountain-200 my-6 w-full border-t-1" />
      {/* Explore Posts */}
      <div className="mt-6 mb-20 flex flex-col space-y-8">
        <div className="flex items-end justify-between">
          <div className="flex flex-col space-y-2">
            <p className="text-mountain-950 font-sans text-2xl font-semibold">
              Explore Recent Posts
            </p>
            <p className="text-mountain-600">
              Browse engaging image and video content created by users in the
              app.
            </p>
          </div>
          <Link
            to="/explore"
            className="flex transform items-center space-x-2 rounded-full bg-white px-8 py-3 shadow-sm duration-300 ease-in-out hover:brightness-90"
          >
            <MdOutlineExplore />
            <p>View All</p>
          </Link>
        </div>
        <RecentPost />
      </div>
      {/* Explore Blogs */}
      <div className="mt-2 flex flex-col space-y-8">
        <div className="flex items-end justify-between">
          <div className="flex flex-col space-y-2">
            <p className="text-mountain-950 font-sans text-2xl font-semibold">
              Read Recent Blogs
            </p>
            <p className="text-mountain-600">
              Browse engaging image and video content created by users in the
              app.
            </p>
          </div>
          <Link
            to="/blogs"
            className="flex transform items-center space-x-2 rounded-full bg-white px-8 py-3 shadow-sm duration-300 ease-in-out hover:brightness-90"
          >
            <MdOutlineExplore />
            <p>View All</p>
          </Link>
        </div>
        <RecentBlog />
      </div>
    </div>
  );
};

export default Dashboard;
