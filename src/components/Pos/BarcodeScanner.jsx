"use client"
import { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

const BarcodeScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setScanning(false);

    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
        },
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader",
          "2of5_reader",
          "code_93_reader",
        ],
      },
      locate: true,
    }, (err) => {
      if (err) {
        setError("Camera error: " + err);
        setLoading(false);
        if (onError) onError(err);
        return;
      }
      Quagga.start();
      setLoading(false);
    });

    Quagga.onDetected((result) => {
      if (result && result.codeResult && result.codeResult.code) {
        setScanning(true);
        Quagga.stop();
        onScan(result.codeResult.code);
      }
    });

    Quagga.onProcessed(() => {});

    return () => {
      Quagga.offDetected();
      Quagga.stop();
    };
  }, [onScan, onError]);

  return (
    <div className="barcode-scanner">
      <div ref={scannerRef} style={{ width: 300, height: 300 }} />
      {loading && <div>Loading camera...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !scanning && <div>Point your camera at a barcode</div>}
    </div>
  );
};

export default BarcodeScanner;
