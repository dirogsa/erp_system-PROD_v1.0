import React, { useState, useEffect } from 'react';

const ImageWithFallback = ({
  src,
  fallbackSrc = 'https://placehold.co/150x150/F1F5F9/94A3B8?text=Sin+Imagen',
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  const handleError = () => {
    // Evitar bucles infinitos si la imagen de fallback también falla
    if (!error) {
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Si la URL de la imagen cambia, reseteamos el estado
  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
