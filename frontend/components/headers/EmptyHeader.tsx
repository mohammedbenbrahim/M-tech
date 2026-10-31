import { Colors } from '@/constants/Colors';
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface EmptyHeaderProps {
  backgroundColor?: string;
}

const EmptyHeader: React.FC<EmptyHeaderProps> = ({ backgroundColor = Colors.light.headerBackground }) => {
  return <View style={[styles.header, { backgroundColor }]} />;
};

const styles = StyleSheet.create({
  header: {
    height: 30, // Adjust height as needed
    width: '100%',
  },
});

export default EmptyHeader;
