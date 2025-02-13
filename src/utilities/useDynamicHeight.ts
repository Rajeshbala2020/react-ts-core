// import { useEffect } from 'react';

// const useDynamicHeight = (
//   selector: string,
//   offset: number,
//   dropOpen: boolean
// ) => {
//   useEffect(() => {
//     const adjustHeight = () => {
//       const element = document.querySelector(selector) as HTMLElement;
//       if (element) {
//         const newHeight = window.innerHeight - offset; // Adjust height dynamically
//         element.style.maxHeight = `${newHeight}px`;
//       }
//     };

//     adjustHeight(); // Initial call
//     window.addEventListener('resize', adjustHeight);
//     return () => window.removeEventListener('resize', adjustHeight);
//   }, [selector, offset, dropOpen]);
// };

// export default useDynamicHeight;
import { useEffect } from 'react';

const useDynamicHeight = (
  selector: string,
  offset: number,
  dropOpen: boolean
) => {
  useEffect(() => {
    const adjustHeight = () => {
      setTimeout(() => {
        // Delay execution to allow rendering
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          const viewportHeight = window.innerHeight;
          const rect = element.getBoundingClientRect(); // Get dropdown position
          const availableSpaceBelow = viewportHeight - rect.top - offset; // Space below dropdown
          const availableSpaceAbove = rect.top - offset; // Space above dropdown

          let maxHeight = availableSpaceBelow;

          // If there’s not enough space below, check above
          if (
            availableSpaceBelow < element.scrollHeight &&
            availableSpaceAbove > availableSpaceBelow
          ) {
            maxHeight = availableSpaceAbove; // Open upwards
          }

          element.setAttribute(
            'style',
            `max-height: ${Math.max(
              0,
              maxHeight > 184 ? maxHeight : 184
            )}px !important;`
          );
        }
      }, 10); // Small delay to ensure accurate dimensions
    };

    if (dropOpen) {
      adjustHeight(); // Initial call
    }

    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [selector, offset, dropOpen]);
};

export default useDynamicHeight;
