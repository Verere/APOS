'use client';

import React, { useRef } from 'react';
import Barcode from 'react-barcode';

export default function BarcodePrinter({ product }) {
  const printRef = useRef();
  const barcodeValue = product?.barcode || '000000000000';

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '', 'width=600,height=400');
    printWindow.document.write('<html><head><title>Print Barcode</title></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className='mx-auto'>
      <div ref={printRef} style={{ padding: '16px', background: 'white' }}>
        <h3>{product.name}</h3>
        <Barcode value={barcodeValue} format="CODE128" />
        {/* <p>{barcodeValue}</p> */}
      </div>
      <button onClick={handlePrint} style={{ marginTop: '10px', background:'black', color:'white', padding:'16px', borderRadius: '40%' }}>
        Print 
      </button>
    </div>
  );
}
