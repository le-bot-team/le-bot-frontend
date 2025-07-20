export const checkEmailOrPhone = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  return emailRegex.test(value) || phoneRegex.test(value);
}
