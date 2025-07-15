import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
} from './SocialNetworksIcon';

const socialNetWorks = [
  {
    name: 'Facebook',
    icon: FacebookIcon,
  },
  {
    name: 'Instagram',
    icon: InstagramIcon,
  },
  {
    name: 'Pinterest',
    icon: PinterestIcon,
  },
];

const PostShare: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white px-4 py-6">
      <div className="text-xl font-bold">Share</div>
      <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white">
        {socialNetWorks.map((socialNetWork) => (
          <div className="flex flex-col items-center justify-center gap-2 rounded px-2 py-1 text-xs">
            {socialNetWork.icon}
            {socialNetWork.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostShare;
