import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef } from 'react';
import loading_anim from '../../../src/loading_anim.json';

interface LoadingProps {
  className?: string;
  fullScreen?: boolean;
}

const Loading = ({ className, fullScreen = true }: LoadingProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(2.5);
    }
  }, []);

  const containerClass = fullScreen
    ? 'flex justify-center items-center w-full h-screen'
    : 'flex justify-center items-center w-full h-full min-h-96';

  return (
    <div className={className || containerClass}>
      <Lottie
        animationData={loading_anim}
        loop={true}
        className="h-48 w-48"
        lottieRef={lottieRef}
      />
    </div>
  );
};

export default Loading;
