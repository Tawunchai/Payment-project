import { useState, useEffect } from 'react';
import EcommerceDesktop from './EcommerceNotebook';
import EcommerceMobile from './EcommercePhone';

const Ecommerce = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isMobile ? <EcommerceMobile /> : <EcommerceDesktop />}
    </>
  );
};

export default Ecommerce;

/**    <header
        className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm mt-14 sm:mt-0"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-semibold tracking-wide">Dashboard</h1>
        </div>
      </header> */