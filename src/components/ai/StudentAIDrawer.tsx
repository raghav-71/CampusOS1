'use client';

import React from 'react';
import CampusAIAssistantModal from './CampusAIAssistantModal';

interface StudentAIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentAIDrawer({ isOpen, onClose }: StudentAIDrawerProps) {
  return <CampusAIAssistantModal isOpen={isOpen} onClose={onClose} />;
}
