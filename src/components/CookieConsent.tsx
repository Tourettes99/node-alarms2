import React from 'react';

interface CookieConsentProps {
  onAccept: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-lg
      bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl
      border border-gray-200 dark:border-gray-700 z-50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Cookie Consent
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        We use cookies to save your workflow data. This allows us to restore your work when you return.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onAccept}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
            transition-colors duration-300"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;