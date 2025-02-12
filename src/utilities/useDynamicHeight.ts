import { useEffect } from 'react';

const useDynamicHeight = (
  selector: string,
  offset: number,
  dropOpen: boolean
) => {
  useEffect(() => {
    const adjustHeight = () => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        const newHeight = window.innerHeight - offset; // Adjust height dynamically
        element.style.maxHeight = `${newHeight}px`;
      }
    };

    adjustHeight(); // Initial call
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [selector, offset, dropOpen]);
};

export default useDynamicHeight;
