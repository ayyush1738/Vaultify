// components/LoaderAnimation.tsx
'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Eth = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <DotLottieReact
        src="https://lottie.host/960b3c48-eb5e-4193-bcf5-163d291508f2/cMnsPpfCDk.lottie"
        loop
        autoplay
        style={{ width: 350, height: 350 }}
      />
    </div>
  );
};

export default Eth;
