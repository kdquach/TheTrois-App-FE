// Unified Icon wrapper using lucide-react-native by default
import React from 'react';
import * as Lucide from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Icon({ name, size = 20, color = '#333', lib = 'lucide', ...rest }) {
  const IconComp = Lucide[name] || null;
  if (lib === 'lucide' && IconComp) return <IconComp size={size} color={color} {...rest} />;
  // Fallback to MaterialCommunityIcons if lucide icon not found
  return <MaterialCommunityIcons name={name} size={size} color={color} {...rest} />;
}
