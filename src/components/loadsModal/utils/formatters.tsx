export const formatTime = (hours: number): string => {
  const totalMinutes = hours * 60;
  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = Math.round(totalMinutes % 60);

  if (hoursPart === 0) {
    return `${minutesPart} minutes`;
  } else if (minutesPart === 0) {
    return `${hoursPart} hours`;
  } else {
    return `${hoursPart}h ${minutesPart}m`;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDistance = (distance: number): string => {
  return `${distance.toFixed(2)} miles`;
};