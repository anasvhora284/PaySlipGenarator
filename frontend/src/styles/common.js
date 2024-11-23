export const colors = {
  primary: '#2D6A4F',
  secondary: '#40916C',
  background: '#F8FAF9',
  splash: '#DDF6E3',
  surface: '#FFFFFF',
  text: {
    primary: '#1B4332',
    secondary: '#74796F',
    light: '#FFFFFF',
    disabled: '#95A5A6',
  },
  border: '#E8F5E9',
  success: '#2E7D32',
  error: '#D32F2F',
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
