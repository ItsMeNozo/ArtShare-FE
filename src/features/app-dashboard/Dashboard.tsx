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
      className="flex flex-col space-y-4 p-4 h-screen overflow-x-hidden sidebar"
      data-testid="dashboard-content"
    >
      {/* Hero section */}
      <div className="relative flex items-center p-4 rounded-xl w-full h-96">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[length:100%_100%] bg-gradient-to-br from-blue-800/60 via-indigo-800/60 to-purple-800/60 rounded-xl animate-gradient" />
        {/* Blurred lighting effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="top-0 left-40 absolute bg-white/80 blur-3xl rounded-full w-80 h-80" />
          <div className="right-0 bottom-0 absolute bg-indigo-200 blur-3xl rounded-full w-80 h-80" />
        </div>
        {/* Text section */}
        <div className="z-10 flex flex-col flex-1 space-y-8">
          <div className="flex flex-col space-y-1 select-none">
            <p className="font-bold text-white text-5xl">
              Welcome to Art Share
            </p>
            <p className="text-mountain-100 text-lg">
              Your Smart Content Creator
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="flex justify-center items-center space-x-2 bg-mountain-950 hover:brightness-105 p-4 rounded-xl w-40 text-white hover:scale-105 transition duration-300 ease-in-out hover:cursor-pointer">
              <p className="font-bold select-none">Version 1.52</p>
            </div>
            <Link to="updates" className="flex justify-center items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-50 hover:brightness-105 p-4 border border-mountain-200 rounded-xl w-40 text-mountain-950 hover:scale-105 transition duration-300 ease-in-out hover:cursor-pointer">
              <IoNewspaperOutline />
              <p className="font-thin select-none">What's new</p>
            </Link>
          </div>
        </div>
        {/* Image section */}
        <img
          src={dashboardBG}
          alt="dashboard-bg"
          className="z-10 mt-8 rounded-xl h-[600px] object-cover scale-x-[-1]"
        />
      </div>
      {/* Current features */}
      <div className="flex flex-col space-y-8 mt-2">
        <div className="flex flex-col space-y-2">
          <p className="font-sans font-semibold text-mountain-950 text-2xl">
            All-in-One Creator Tools
          </p>
          <p className="text-mountain-600">
            AI-powered tools for content creation made easy
          </p>
        </div>
        <div className="gap-x-4 grid grid-cols-4">
          {featuresShowcase.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col bg-white shadow-md border border-mountain-200 rounded-xl w-72 h-86"
            >
              <div className="flex flex-col">
                <div className="flex rounded-t-xl h-48 overflow-hidden">
                  <img
                    src={feature.url}
                    className="flex rounded-t-xl w-full object-cover group-hover:scale-105 duration-300 ease-in-out transform"
                  />
                </div>
                <div className="flex flex-col space-y-2 p-2">
                  <p className="font-medium text-lg line-clamp-1">
                    {feature.label}
                  </p>
                  <p className="text-mountain-600 text-sm line-clamp-2">
                    {feature.description}
                  </p>
                </div>
              </div>
              <Link
                to="/image/tool/text-to-image"
                className="right-2 bottom-2 absolute flex items-center space-x-2 bg-mountain-100 hover:brightness-105 px-4 py-2 rounded-lg text-mountain-950 duration-300 ease-in-out transform"
              >
                <p>Explore</p>
                <FaArrowRightLong />
              </Link>
            </div>
          ))}
        </div>
      </div>
      {/* What's new */}
      <div className="flex flex-col space-y-8 mt-2">
        <div className="flex flex-col space-y-2">
          <p className="font-sans font-semibold text-mountain-950 text-2xl">
            Discover What's New
          </p>
          <p className="text-mountain-600">
            Planning content generation and automate publishing across platforms{' '}
            <Link to="/dashboard/updates" className="underline">
              version 1.52
            </Link>
          </p>
        </div>
        <div className="gap-x-4 grid grid-cols-4">
          {featuresShowcase.slice(3, 7).map((feature, index) => (
            <div
              key={index}
              className="group relative flex flex-col bg-white shadow-md border border-mountain-200 rounded-xl w-72 h-86"
            >
              <div className="flex flex-col">
                <div className="flex rounded-t-xl h-48 overflow-hidden">
                  <img
                    src={feature.url}
                    className="flex opacity-90 brightness-85 rounded-t-xl object-cover group-hover:scale-105 duration-300 ease-in-out transform"
                  />
                </div>
                <div className="flex flex-col space-y-2 p-2">
                  <p className="font-medium text-lg line-clamp-1">
                    {feature.label}
                  </p>
                  <p className="text-mountain-600 text-sm line-clamp-2">
                    {feature.description}
                  </p>
                </div>
              </div>
              <Link
                to={feature.destination}
                className="right-2 bottom-2 absolute flex items-center space-x-2 bg-mountain-100 hover:brightness-105 px-4 py-2 rounded-lg text-mountain-950 duration-300 ease-in-out transform"
              >
                <p>Explore</p>
                <FaArrowRightLong />
              </Link>
            </div>
          ))}
        </div>
      </div>
      <hr className="my-6 border-mountain-200 border-t-1 w-full" />
      {/* Explore Posts */}
      <div className="flex flex-col space-y-8 mt-6 mb-20">
        <div className="flex justify-between items-end">
          <div className="flex flex-col space-y-2">
            <p className="font-sans font-semibold text-mountain-950 text-2xl">
              Explore Recent Posts
            </p>
            <p className="text-mountain-600">
              Browse engaging image and video content created by users in the
              app.
            </p>
          </div>
          <Link
            to="/explore"
            className="flex items-center space-x-2 bg-white shadow-sm hover:brightness-90 px-8 py-3 rounded-full duration-300 ease-in-out transform"
          >
            <MdOutlineExplore />
            <p>View All</p>
          </Link>
        </div>
        <RecentPost />
      </div>
      {/* Explore Blogs */}
      <div className="flex flex-col space-y-8 mt-2">
        <div className="flex justify-between items-end">
          <div className="flex flex-col space-y-2">
            <p className="font-sans font-semibold text-mountain-950 text-2xl">
              Read Recent Blogs
            </p>
            <p className="text-mountain-600">
              Browse engaging image and video content created by users in the
              app.
            </p>
          </div>
          <Link
            to="/blogs"
            className="flex items-center space-x-2 bg-white shadow-sm hover:brightness-90 px-8 py-3 rounded-full duration-300 ease-in-out transform"
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