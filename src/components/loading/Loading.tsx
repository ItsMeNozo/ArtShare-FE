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
    <div className="flex h-screen w-full items-center justify-center">
      <Lottie
        animationData={loading_anim}
        loop={true}
        className="h-80 w-80"
        lottieRef={lottieRef}
      />
    </div>
  );
};

export default Loading;
