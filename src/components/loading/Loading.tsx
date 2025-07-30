import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef } from 'react';
import loading_anim from '../../../src/loading_anim.json';

const Loading = () => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(2.5);
    }
  }, []);

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <Lottie
        animationData={loading_anim}
        loop={true}
        className="w-48 h-48"
        lottieRef={lottieRef}
      />
    </div>
  );
};

export default Loading;
