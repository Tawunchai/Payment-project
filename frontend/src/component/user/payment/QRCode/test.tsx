import React from 'react';
import { FaPaypal, FaFacebook, FaInstagram } from 'react-icons/fa';

const PayPalCard: React.FC = () => {
  return (
    <div className="paddings min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg text-center space-y-5 border border-gray-300">
        {/* Logo */}
        <div className="text-sm text-gray-500 border-2 border-dashed border-gray-400 rounded-full w-28 h-28 mx-auto flex items-center justify-center">
          <span className="text-xs leading-tight">YOUR LOGO<br />HERE</span>
        </div>

        {/* PayPal */}
        <div className="flex items-center justify-center gap-3">
          <FaPaypal className="text-blue-600 text-3xl" />
          <span className="text-xl font-bold text-gray-700">PayPal</span>
        </div>

        {/* QR Code */}
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://yourpaypal.link"
          alt="QR Code"
          className="mx-auto"
        />

        {/* Text */}
        <p className="text-gray-600 text-base tracking-wide font-medium">SCAN ME TO PAY</p>

        {/* Social & Website */}
        <div className="flex items-center justify-center gap-4 text-base text-gray-600">
          <FaFacebook className="text-blue-600 text-xl" />
          <FaInstagram className="text-pink-500 text-xl" />
          <span>@socialusername</span>
        </div>
        <a
          href="https://www.yourwebsite.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-base text-blue-600 hover:underline font-medium"
        >
          www.yourwebsite.com
        </a>
      </div>
    </div>
  );
};

export default PayPalCard;
