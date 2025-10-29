import { useState, useEffect } from 'react';
import EcommerceDesktop from './EcommerceNotebook';
import EcommerceMobile from './EcommercePhone';
import EcommerceIPad from './EcommerceIPad'; 

const Ecommerce = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'ipad' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceType('mobile');
      } else if (width > 768 && width <= 1300) {
        setDeviceType('ipad');
      } else {
        setDeviceType('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {deviceType === 'mobile' && <EcommerceMobile />}
      {deviceType === 'ipad' && <EcommerceIPad />}   {/* 🆕 แสดง iPad */}
      {deviceType === 'desktop' && <EcommerceDesktop />}
    </>
  );
};

export default Ecommerce;
