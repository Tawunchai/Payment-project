import React from "react";
import { FiPhone, FiMail } from "react-icons/fi";
import Logo2 from "../../../../assets/Real/logo2.png";

const FooterFormal: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700">
      <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* ซ้าย */}
        <div className="flex flex-col items-start space-y-2">
          <img src={Logo2} alt="SUT Logo" className="w-24 h-auto mb-2" />
          <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
            Suranaree University of Technology (SUT)
            <br />
            111 University Ave, Muang, Nakhon Ratchasima 30000
          </p>
        </div>

        {/* ขวา */}
        <div className="flex flex-col items-start space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FiPhone className="text-blue-500" />
            <a href="tel:+6644223000" className="hover:text-blue-600 transition">
              +66 44 223 000
            </a>
          </div>
          <div className="flex items-center gap-2">
            <FiMail className="text-blue-500" />
            <a href="mailto:info@sut.ac.th" className="hover:text-blue-600 transition">
              info@sut.ac.th
            </a>
          </div>
        </div>
      </div>

      {/* ลิขสิทธิ์ */}
      <div className="border-t border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Suranaree University of Technology (SUT)
        </div>
      </div>
    </footer>
  );
};

export default FooterFormal;
