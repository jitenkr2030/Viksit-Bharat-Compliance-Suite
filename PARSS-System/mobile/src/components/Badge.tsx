import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: any;
  textStyle?: any;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  const badgeStyle = [
    styles.badge,
    styles[`${variant}Badge`],
    styles[`${size}Badge`],
    style,
  ];

  const badgeTextStyle = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={badgeTextStyle}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  defaultBadge: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  primaryBadge: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondaryBadge: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  successBadge: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  warningBadge: {
    backgroundColor: theme.colors.warning,
    borderColor: theme.colors.warning,
  },
  errorBadge: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  infoBadge: {
    backgroundColor: theme.colors.info,
    borderColor: theme.colors.info,
  },
  smallBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  mediumBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  largeBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  text: {
    fontWeight: theme.typography.body.fontWeight as any,
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.typography.caption.fontSize,
  },
  mediumText: {
    fontSize: theme.typography.caption.fontSize,
  },
  largeText: {
    fontSize: theme.typography.body.fontSize,
  },
  defaultText: {
    color: theme.colors.text.secondary,
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.white,
  },
  successText: {
    color: theme.colors.white,
  },
  warningText: {
    color: theme.colors.white,
  },
  errorText: {
    color: theme.colors.white,
  },
  infoText: {
    color: theme.colors.white,
  },
});