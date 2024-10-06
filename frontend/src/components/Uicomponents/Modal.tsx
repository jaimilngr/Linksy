import { ReactNode, useEffect } from "react"; 
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  // Close modal if the backdrop is clicked
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Close modal when clicking outside the modal content
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow; 
    document.body.style.overflow = isOpen ? "hidden" : originalOverflow; 

    return () => {
      document.body.style.overflow = originalOverflow; 
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick} 
    >
      <div className="relative bg-white dark:bg-[#384454] w-11/12 md:w-1/2 lg:w-1/3 p-6 rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 dark:text-white hover:text-gray-900" 
        >
          &#10005;
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root") as HTMLElement
  );
};
