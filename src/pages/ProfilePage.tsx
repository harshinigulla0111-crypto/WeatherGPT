import React from 'react';
import { ProfileModal } from '../components/profile/ProfileModal';

export const ProfilePage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-300">
      <ProfileModal />
    </div>
  );
};
