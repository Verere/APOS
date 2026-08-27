// import React from 'react';
// import ReactLoading from 'react-loading';
// import { PulseLoader } from "react-spinners";


// const types ={
// 	blank,
// balls,
// bars,
// bubbles,
// cubes,
// cylon,
// spin,
// spinningBubbles,
// spokes
// }

// const LoadingComponent = ({ type, color, height, width }) => (
// 	<ReactLoading type={type} color={color} height={height} width={width} />
	
	
// );

// export default LoadingComponent;

"use client";

import { PulseLoader } from "react-spinners";

export function MarketBookLoading({
  message = "Preparing your marketbook…",
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className}`.trim()}
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="marketbook-loader" aria-label="Loading marketbook">
        <span className="marketbook-loader__left">market</span>
        <span className="marketbook-loader__divider" aria-hidden="true">
          <span className="marketbook-loader__spine-glow" aria-hidden="true" />
          │
        </span>
        <span className="marketbook-loader__right">book</span>
      </div>

      <p className="marketbook-loader__message mt-3 text-sm font-medium tracking-[0.12em] text-slate-600 uppercase dark:text-slate-200">
        {message}
      </p>
    </div>
  );
}

export default function LoadingComponent({ text, color, loading, size }) {
  return (
    <span className="flex gap-1 items-center">
      {text}
      <PulseLoader
        color={color}
        loading={loading}
        size={size || 10}
        data-testid="loader"
      />
    </span>
  );
}

