export const colors = {
  primary: '#4361ee',
  secondary: '#3f37c9',
  background: '#f8f9fa',
  surface: '#ffffff',
  error: '#ef233c',
  success: '#48c774',
  text: {
    primary: '#2b2d42',
    secondary: '#8d99ae',
    light: '#ffffff',
  },
  divider: '#e9ecef',
  warning: '#ffc107',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    color: colors.text.secondary,
  },
};

export const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 4,
    margin: spacing.md,
    padding: spacing.md,
  },
};
