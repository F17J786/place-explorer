import { Platform, StatusBar, StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';

export const createCheckinListScreenStyles = (COLORS: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    loadingIndicator: {
      marginTop: 60,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary,
      paddingTop:
        Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 48,
      paddingBottom: 12,
      paddingHorizontal: 8,
      elevation: 4,
    },
    backBtn: { padding: 9 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
    list: { padding: 14, gap: 10 },
    listCount: {
      fontSize: 12,
      color: COLORS.textSub,
      marginBottom: 4,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: COLORS.white,
      borderRadius: 14,
      padding: 14,
      elevation: 1,
      shadowColor: COLORS.cardShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    cardContent: { flex: 1, gap: 3 },
    userName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: COLORS.textLight },
    distanceText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
    badge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.successBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    emptyText: { fontSize: 13, color: COLORS.textSub },
  });
