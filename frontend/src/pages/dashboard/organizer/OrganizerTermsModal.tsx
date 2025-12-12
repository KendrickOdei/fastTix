
import React from 'react';

interface OrganizerTermsModalProps {
  onAccept: () => void;
  onDecline: () => void;
  isOpen: boolean;
}

const OrganizerTermsModal: React.FC<OrganizerTermsModalProps> = ({ onAccept, onDecline, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-green-800">Platform Agreement & Guidelines </h2>
          <p className="text-sm text-gray-600 mt-1">Please read and accept before creating your event.</p>
        </div>

        {/* Content Scrollable Area */}
        <div className="p-6 overflow-y-auto flex-grow text-gray-700 space-y-4">
          
          <p>Welcome to the fastTix Organizer platform! To ensure a great experience for everyone, please review the following key policies:</p>

          <h3 className="text-lg font-semibold text-gray-800">1. Content & Integrity Policy</h3>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
            <li>All events must be legal, accurately described, and hosted in good faith.</li>
            <li>**Prohibited:** Events promoting hate speech, violence, illegal activities, or adult content (unless explicitly pre-approved).</li>
            <li>We reserve the right to remove any event violating these terms without notice.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800">2. Financial Terms (Example)</h3>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
            <li>A standard **8% platform fee** applies to all ticket sales.</li>
            <li>Payouts are processed 48 hours after the event successfully concludes.</li>
            <li>All refund requests must be handled through the fastTix dashboard.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800">3. Ticket Management</h3>
          <p className="text-sm">You are responsible for managing ticket capacity and ensuring attendees gain entry smoothly at the venue. Capacity limits must be strictly adhered to.</p>
          
        </div>

        {/* Footer & Actions */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onDecline}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Decline & Go Back
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            I Accept the Terms & Conditions
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizerTermsModal;