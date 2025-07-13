// Core
import { Link } from 'react-router-dom';

// Assets
import illustrate from '/illustration2.png';
import app_logo from '/logo_app_v_101.png';

const user1 =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const user2 =
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const user3 =
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

// Libs
import { motion } from 'framer-motion';

// Icons
import { FaRegCompass, FaUserFriends } from 'react-icons/fa';
import { FaFacebookF } from 'react-icons/fa6';
import { IoMdArrowRoundForward, IoMdColorPalette } from 'react-icons/io';
import { IoArrowUp, IoHeart, IoStar } from 'react-icons/io5';
import { MdSettingsAccessibility } from 'react-icons/md';
import { RiImageAiLine } from 'react-icons/ri';
import { SiSocialblade } from 'react-icons/si';

//Components
import { PricingSection } from '@/components/ui/pricing-section';
import { PAYMENT_FREQUENCIES, TIERS } from '@/constants/planTiers';
import { BsInstagram, BsTwitterX } from 'react-icons/bs';

const LandingPage = () => {
  return (
    <div className="flex h-screen w-full flex-col overflow-auto bg-white">
      {/* Header */}
      <div className="flex h-20 w-full items-center justify-between bg-white px-4 py-5 md:px-8 lg:px-16 xl:px-24">
        <div className="flex items-center space-x-2">
          <img
            src={app_logo}
            className="h-8 w-8 rounded-sm shadow md:h-10 md:w-10"
          />
          <p className="bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 bg-clip-text text-base font-bold text-transparent md:text-xl">
            Art Share
          </p>
        </div>
        <div className="flex items-center space-x-4 font-semibold md:space-x-8">
          <div className="text-mountain-950 hover:cursor-pointer hover:text-indigo-600 max-sm:hidden">
            Features
          </div>
          <div className="text-mountain-950 hover:cursor-pointer hover:text-indigo-600 max-sm:hidden">
            Testimonials
          </div>
          <div className="text-mountain-950 hover:cursor-pointer hover:text-indigo-600 max-sm:hidden">
            Pricing
          </div>
          <Link
            to="/explore"
            className="text-mountain-50 rounded-full bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 p-1 px-4 text-sm hover:cursor-pointer hover:brightness-110 md:p-2 md:px-6 md:text-base"
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="fixed -bottom-1 z-50 flex h-20 w-full items-center justify-center bg-white/70 py-5 sm:hidden">
        <div className="flex h-12 w-[90%] items-center justify-between rounded-full border bg-white px-4 font-semibold md:space-x-8">
          <div className="text-mountain-950 hover:cursor-pointer hover:text-indigo-600">
            Features
          </div>
          <div className="text-mountain-950 hover:cursor-pointer hover:text-indigo-600">
            Testimonials
          </div>
          <div className="text-mountain-950 hover:cursor-pointer hover:text-indigo-600">
            Pricing
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="bg-mountain-50 flex w-full flex-col items-center justify-between gap-x-4 p-4 px-4 sm:min-h-[400px] sm:flex-row md:p-8 md:px-10 lg:min-h-[500px] lg:p-12 lg:px-16 xl:min-h-[600px] xl:p-20 xl:px-24">
        <div className="my-4 flex w-full flex-col space-y-4 sm:my-0 sm:w-[50%] lg:space-y-6 xl:space-y-8">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col xl:space-y-2"
          >
            <p className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 bg-clip-text text-2xl font-bold text-transparent md:text-3xl lg:text-4xl xl:text-5xl">
              Create, Share, Inspire
            </p>
            <p className="bg-gradient-to-r from-blue-700 to-purple-800 bg-clip-text text-2xl font-bold text-transparent md:text-3xl lg:text-4xl xl:text-5xl">
              Art Without Limits
            </p>
          </motion.div>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-mountain-800 text-xs md:text-sm lg:text-lg xl:text-xl"
          >
            Art Share is a creative platform for artists to showcase their work,
            connect with a vibrant community, and find inspiration through
            shared creativity.
          </motion.p>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex space-x-4"
          >
            <Link
              to="/explore"
              className="text-mountain-50 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 p-1 px-4 hover:cursor-pointer lg:p-3 lg:px-6"
            >
              <p className="mr-2 text-sm md:text-base">Start For Free</p>
              <IoMdArrowRoundForward className="text-white" />
            </Link>
            <Link
              to="/"
              className="text-mountain-950 rounded-full border bg-white p-1 px-6 text-sm shadow md:text-base lg:p-3"
            >
              Learn More
            </Link>
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex items-center space-x-2 lg:space-x-4"
          >
            <div className="flex -space-x-1 overflow-hidden">
              <img
                className="inline-block size-6 rounded-full ring-2 ring-white md:size-8"
                src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
              <img
                className="inline-block size-6 rounded-full ring-2 ring-white md:size-8"
                src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
              <img
                className="inline-block size-6 rounded-full ring-2 ring-white sm:hidden md:inline-block lg:size-8"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                alt=""
              />
              <img
                className="inline-block size-6 rounded-full ring-2 ring-white sm:hidden lg:inline-block lg:size-8"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
            </div>
            <p className="text-mountain-600 text-xs lg:text-base">
              Joined by <span className="font-bold">5000+</span> Art Enthusiasts
              & Artists
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex w-full sm:w-[50%] sm:justify-end"
        >
          <img
            src={illustrate}
            className="flex h-fit w-[540px] rounded-xl border-10 border-white shadow-md"
          />
          <div className="absolute right-0 -bottom-4 flex h-16 w-48 items-center space-x-2 rounded-lg bg-white px-4 shadow-md md:-right-6 lg:-right-12 lg:-bottom-6 lg:h-24 lg:w-64">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 lg:h-14 lg:w-14">
              <SiSocialblade className="size-4 text-indigo-700 lg:size-6" />
            </div>
            <div className="flex flex-col">
              <p className="text-mountain-600 text-xs lg:text-sm">
                Social Connect
              </p>
              <p className="text-mountain-900 text-sm font-bold lg:text-lg">
                +27% This Week
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Core Features */}
      <div className="my-4 flex h-fit w-full flex-col justify-center space-y-12 bg-white p-4 px-4 sm:my-0 sm:min-h-[900px] md:p-8 md:px-8 lg:min-h-[800px] lg:p-12 lg:px-16 xl:p-20 xl:px-24">
        <div className="flex flex-col items-center justify-center space-y-3 lg:space-y-5">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-700 to-purple-800 bg-clip-text font-semibold text-transparent"
          >
            POWERFUL FEATURES
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="xs:text-xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 bg-clip-text text-lg font-bold text-transparent sm:text-3xl lg:text-4xl"
          >
            Everything You Need to Achieve More
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-mountain-800 flex w-[80%] text-center text-base lg:text-lg xl:w-[50%]"
          >
            Art Share is a creative platform for artists to showcase their work,
            connect with a vibrant community, and find inspiration through
            shared creativity.
          </motion.p>
        </div>
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col"
          >
            <div className="flex w-full items-center space-x-2 rounded-t-lg bg-gradient-to-r from-blue-500 to-blue-700 px-2 py-5 xl:space-x-4 xl:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <IoMdColorPalette className="size-6 text-white" />
              </div>
              <p className="text-lg font-semibold text-white">
                Showcase Your Art
              </p>
            </div>
            <div className="text-mountain-700 flex rounded-b-lg bg-white px-2 py-5 shadow-lg xl:px-5">
              <p className="line-clamp-2">
                Upload and present your artwork in high quality, making it easy
                to share your creativity.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col"
          >
            <div className="flex w-full items-center space-x-2 rounded-t-lg bg-gradient-to-r from-indigo-500 to-indigo-700 px-2 py-5 xl:space-x-4 xl:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <FaUserFriends className="size-6 text-white" />
              </div>
              <p className="text-lg font-semibold text-white">
                Connect with Artists
              </p>
            </div>
            <div className="text-mountain-700 flex rounded-b-lg bg-white px-2 py-5 shadow-lg xl:px-5">
              <p className="line-clamp-2">
                Follow, interact, and collaborate with a vibrant community of
                creators across different art styles.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
            className="flex flex-col"
          >
            <div className="flex w-full items-center space-x-2 rounded-t-lg bg-gradient-to-r from-purple-500 to-purple-700 px-2 py-5 xl:space-x-4 xl:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <IoHeart className="size-6 text-white" />
              </div>
              <p className="text-lg font-semibold text-white">
                Gain Recognition
              </p>
            </div>
            <div className="text-mountain-700 flex rounded-b-lg bg-white px-2 py-5 shadow-lg xl:px-5">
              <p className="line-clamp-2">
                Receive likes, comments, and feedback to grow your presence and
                get discovered by more art lovers.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6 }}
            className="flex flex-col"
          >
            <div className="flex w-full items-center space-x-2 rounded-t-lg bg-gradient-to-r from-sky-500 to-sky-700 px-2 py-5 xl:space-x-4 xl:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <RiImageAiLine className="size-6 text-white" />
              </div>
              <p className="text-lg font-semibold text-white">
                AI Art Generation
              </p>
            </div>
            <div className="text-mountain-700 flex rounded-b-lg bg-white px-2 py-5 shadow-lg xl:px-5">
              <p className="line-clamp-2">
                Transform your ideas into stunning digital masterpieces with
                powerful AI-powered tools.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8 }}
            className="flex flex-col"
          >
            <div className="flex w-full items-center space-x-2 rounded-t-lg bg-gradient-to-r from-cyan-500 to-cyan-700 px-2 py-5 xl:space-x-4 xl:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <FaRegCompass className="size-6 text-white" />
              </div>
              <p className="text-lg font-semibold text-white">
                Discover & Explore
              </p>
            </div>
            <div className="text-mountain-700 flex rounded-b-lg bg-white px-2 py-5 shadow-lg xl:px-5">
              <p className="line-clamp-2">
                Browse trending artworks, explore diverse styles, and find
                inspiration from a global community.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="flex flex-col"
          >
            <div className="xl flex w-full items-center space-x-2 rounded-t-lg bg-gradient-to-r from-teal-500 to-teal-700 px-2 py-5 xl:space-x-4 xl:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <MdSettingsAccessibility className="size-6 text-white" />
              </div>
              <p className="text-lg leading-5 font-semibold text-white">
                Personalized Experience
              </p>
            </div>
            <div className="text-mountain-700 flex rounded-b-lg bg-white px-2 py-5 shadow-lg xl:px-5">
              <p className="line-clamp-2">
                Browse trending artworks, explore diverse styles, and find
                inspiration from a global community.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Testimonials */}
      <div className="bg-mountain-50 flex h-fit w-full flex-col justify-center space-y-12 p-4 px-4 sm:min-h-[400px] md:min-h-[500px] md:p-8 md:px-8 lg:p-12 lg:px-16 xl:min-h-[600px] xl:p-20 xl:px-24">
        <div className="flex flex-col items-center justify-center space-y-3 lg:space-y-5">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-700 to-purple-800 bg-clip-text font-semibold text-transparent"
          >
            SUCCESS STORIES
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 bg-clip-text text-xl font-bold text-transparent sm:text-3xl lg:text-4xl"
          >
            What Our Users Say
          </motion.p>
        </div>
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col rounded-lg shadow-md"
          >
            <div className="flex w-full items-center space-x-4 rounded-t-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-1.5" />
            <div className="text-mountain-700 flex flex-col justify-between space-y-4 bg-white px-5 py-5">
              <p className="line-clamp-2">
                Sharing my art and connecting with other creators is so easy!
                The AI feature is great to explore new ideas.
              </p>
              <div className="flex space-x-2">
                <img src={user1} className="h-12 w-12 rounded-full" />
                <div className="flex flex-col justify-end leading-4">
                  <p className="font-semibold">David Chen</p>
                  <p className="text-mountain-600 text-sm">Freelance Artist</p>
                </div>
              </div>
            </div>
            <div className="flex w-full space-x-1 rounded-b-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="flex flex-col rounded-lg shadow-md"
          >
            <div className="flex w-full items-center space-x-4 rounded-t-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-1.5" />
            <div className="text-mountain-700 flex flex-col justify-between space-y-4 bg-white px-5 py-5">
              <p className="line-clamp-2">
                A good platform for art inspiration! The community is
                supportive, I love seeing diverse artworks.
              </p>
              <div className="flex space-x-2">
                <img src={user2} className="h-12 w-12 rounded-full" />
                <div className="flex flex-col justify-end leading-4">
                  <p className="font-semibold">Alan Smith</p>
                  <p className="text-mountain-600 text-sm">Art Enthusiast</p>
                </div>
              </div>
            </div>
            <div className="flex w-full space-x-1 rounded-b-lg bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4">
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="flex flex-col rounded-lg shadow-md"
          >
            <div className="flex w-full items-center space-x-4 rounded-t-lg bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-1.5" />
            <div className="text-mountain-700 flex flex-col justify-between space-y-4 bg-white px-5 py-5">
              <p className="line-clamp-2">
                Art Share makes showcasing my work effortless! The design is
                sleek, and I’ve gained great exposure.
              </p>
              <div className="flex space-x-2">
                <img src={user3} className="h-12 w-12 rounded-full" />
                <div className="flex flex-col justify-end leading-3">
                  <p className="font-semibold">Emma Brown</p>
                  <p className="text-mountain-600 text-sm">Content Creator</p>
                </div>
              </div>
            </div>
            <div className="flex w-full space-x-1 rounded-b-lg bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4">
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
              <IoStar className="text-yellow-400" />
            </div>
          </motion.div>
        </div>
      </div>
      {/* Pricing */}
      <div className="flex h-fit w-full flex-col justify-center bg-white p-8 px-10 md:min-h-[1600px] lg:p-12 lg:px-16 xl:min-h-[1200px] xl:p-20 xl:px-24">
        <div className="flex flex-col items-center justify-center space-y-3 lg:space-y-5">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-700 to-purple-800 bg-clip-text font-semibold text-transparent"
          >
            PRICING PLANS
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 bg-clip-text text-xl font-bold text-transparent sm:text-3xl lg:text-4xl"
          >
            Choose The Right Plan For You
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-mountain-800 flex w-full items-center justify-center text-center text-base lg:text-lg"
          >
            Flexible options to suit individuals, just pick the one that fuels
            your creativity!
          </motion.p>
        </div>
        <div className="relative flex w-full items-center justify-between">
          <div className="absolute inset-0 -z-10">
            <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:35px_35px] opacity-30" />
          </div>
          <PricingSection frequencies={PAYMENT_FREQUENCIES} tiers={TIERS} />
        </div>
      </div>
      <div className="flex min-h-20 w-full items-center justify-center">
        <div className="bg-mountain-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-md transition duration-300 hover:scale-120 hover:cursor-pointer">
          <IoArrowUp />
        </div>
      </div>
      {/* Footer */}
      <div className="bg-mountain-950 flex min-h-[300px] w-full flex-col justify-center sm:min-h-[240px]">
        <div className="flex flex-col px-10 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-16 xl:px-24">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <img
                alt="app-logo"
                src={app_logo}
                className="h-10 w-10 rounded-sm shadow"
              />
              <p className="bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-xl font-bold text-transparent">
                Art Share
              </p>
            </div>
            <p className="text-mountain-300 line-clamp-1 text-sm lg:text-base">
              A creative platform for artists to showcase, connect, and find
              inspiration.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4 lg:space-x-8">
              <div className="text-mountain-50 text-sm font-semibold lg:text-base">
                Features
              </div>
              <div className="text-mountain-50 text-sm font-semibold lg:text-base">
                Benefits
              </div>
              <div className="text-mountain-50 text-sm font-semibold lg:text-base">
                Testimonials
              </div>
              <div className="text-mountain-50 text-sm font-semibold lg:text-base">
                Pricing
              </div>
            </div>
            <div className="flex space-x-4 sm:justify-end">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border">
                <FaFacebookF className="size-4 text-white" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border">
                <BsInstagram className="size-4 text-white" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border">
                <BsTwitterX className="size-4 text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-mountain-700 flex flex-col border-t-2 px-10 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-16 xl:px-24">
          <p className="text-mountain-50 text-sm">
            © 2025 Copyright. All rights reserved.
          </p>
          <div className="flex space-x-4 sm:space-x-8">
            <Link to="/" className="text-mountain-50 text-sm underline">
              Terms and Conditions
            </Link>
            <Link to="/" className="text-mountain-50 text-sm underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
