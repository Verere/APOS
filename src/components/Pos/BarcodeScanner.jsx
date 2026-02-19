"use client"
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let html5QrcodeScanner;
    setLoading(true);
    setError(null);
    setScanning(false);

    const startScanner = async () => {
      try {
        html5QrcodeScanner = new Html5Qrcode(scannerRef.current.id);
        await html5QrcodeScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            setScanning(true);
            setLoading(false);
            // Only stop if scanner is running
            if (html5QrcodeScanner.getState() === 2) { // 2 = RUNNING
              html5QrcodeScanner.stop().catch(() => {});
            }
            onScan(decodedText);
          },
          (err) => {
            setError("Scan error: " + err);
            setLoading(false);
            if (onError) onError(err);
          }
        );
      } catch (e) {
        setError("Camera error: " + e.message);
        setLoading(false);
        if (onError) onError(e);
      }
    };

    startScanner();

    return () => {
      if (html5QrcodeScanner) {
        if (html5QrcodeScanner.getState() === 2) { // RUNNING
          html5QrcodeScanner.stop().catch(() => {});
        }
        html5QrcodeScanner.clear();
      }
    };
  }, [onScan, onError]);

  return (
    <div className="barcode-scanner">
      <div id="barcode-scanner-view" ref={scannerRef} style={{ width: 300, height: 300 }} />
      {loading && <div>Loading camera...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !scanning && <div>Point your camera at a barcode</div>}
    </div>
  );
};

export default BarcodeScanner;
