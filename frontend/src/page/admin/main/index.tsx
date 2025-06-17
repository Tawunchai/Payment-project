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
