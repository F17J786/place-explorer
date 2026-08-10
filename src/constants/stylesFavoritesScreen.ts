import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';

export const createFavoritesScreenStyles = (COLORS: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.bg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: COLORS.primary,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 125,
      zIndex: 0,
    },
    headerBtn: {
      padding: 4,
    },
    headerRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.white,
      marginLeft: 4,
    },
    headerRight: {
      flexDirection: 'row',
      gap: 4,
    },
    headerBadge: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      minWidth: 24,
      alignItems: 'center',
    },
    headerBadgeText: {
      color: COLORS.surface,
      fontSize: 12,
      fontWeight: '700',
    },
    headerTextBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    headerTextBtnLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.headerTextMuted,
    },
    headerDangerText: {
      color: COLORS.error,
    },
    listContent: {
      paddingHorizontal: 14,
      paddingBottom: 14,
    },
    listContentEmpty: {
      flex: 1,
    },
    separator: {
      height: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      marginTop: 50,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.surface,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1.5,
      borderColor: 'transparent',
      elevation: 2,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      gap: 12,
    },
    cardSelected: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primarySelectedBg,
    },
    cardPressed: {
      opacity: 0.92,
    },
    iconBadge: {
      width: 46,
      height: 46,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBody: {
      flex: 1,
      gap: 3,
    },
    cardName: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.cardTitleText,
    },
    cardAddressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    cardAddress: {
      flex: 1,
      fontSize: 12,
      color: COLORS.textSecondary,
    },
    categoryChip: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 1,
      marginTop: 2,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    deleteBtn: {
      padding: 4,
    },
    hitSlop: {
      top: 8,
      bottom: 8,
      left: 8,
      right: 8,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: COLORS.checkboxBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      gap: 12,
    },
    emptyIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: COLORS.iconBgSubtle,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: COLORS.cardTitleText,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 13,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    selectionBar: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: COLORS.selectionBarBorder,
      elevation: 8,
    },
    selectionBarBtn: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 6,
    },
    selectionBarBtnSecondary: {
      backgroundColor: COLORS.surfaceMuted,
    },
    selectionBarBtnSecondaryText: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.textSec,
    },
    selectionBarBtnDanger: {
      backgroundColor: COLORS.error,
    },
    selectionBarBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.surface,
    },
  });
