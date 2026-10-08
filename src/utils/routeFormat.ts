import i18n from 'i18next';

export const formatRouteDuration = (seconds: number): string => {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));

  if (totalMinutes < 60) {
    return i18n.t('map:routeResult.durationMinutes', { count: totalMinutes });
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hoursText = i18n.t('map:routeResult.durationHoursPart', {
    count: hours,
  });

  if (minutes === 0) {
    return hoursText;
  }

  const minutesText = i18n.t('map:routeResult.durationMinutesPart', {
    count: minutes,
  });

  return i18n.t('map:routeResult.durationHours', { hoursText, minutesText });
};

export const formatRouteDistance = (meters: number): string => {
  if (meters < 1000) {
    return i18n.t('map:routeResult.distanceMeters', {
      meters: Math.round(meters),
    });
  }
  const km = meters / 1000;
  const formatted = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 1,
  }).format(km);
  return i18n.t('map:routeResult.distanceKm', { km: formatted });
};
