'use client';

import { useEffect, useRef } from 'react';
import bwipjs from 'bwip-js';

export default function Barcode({ code }) {
  const canvasRef = useRef();

  useEffect(() => {
    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: 'ean13',
        text: code,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      });
    } catch (e) {
      console.error('Barcode generation error:', e);
    }
  }, [code]);

  return <canvas ref={canvasRef} />;
}
