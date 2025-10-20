import React from 'react';
import PrintcareLogo from '../assets/printcareLogo.png';
import ITSupportImg from '../assets/ITSupport.jpg';

export const PrintcareLogoPlaceholder = ({ className = '', alt = 'Printcare Logo' }) => (
  <img
    src={PrintcareLogo}
    alt={alt}
    className={`rounded object-contain ${className}`}
    loading="lazy"
  />
);

export const ITSupportImage = ({ className = '', alt = 'IT Support' }) => (
  <img
    src={ITSupportImg}
    alt={alt}
    className={`rounded-lg object-cover ${className}`}
    loading="lazy"
  />
);