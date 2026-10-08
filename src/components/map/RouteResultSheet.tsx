import React, { forwardRef, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';
import { COLORS } from '@/constants/constants';
import { RoutePoint } from '@/types/mapScreen.type';
import {
  RouteModeActiveIndex,
  RouteModeLoading,
  RouteModeResults,
  RouteStepInfo,
  TravelMode,
} from '@/types/route.type';
import { formatRouteDistance, formatRouteDuration } from '@/utils/routeFormat';
import { routeMarkerStyles } from './RouteMarker';

interface RouteResultSheetProps {
  pointA: RoutePoint | null;
  pointB: RoutePoint | null;
  selectedMode: TravelMode;
  onSelectMode: (mode: TravelMode) => void;
  routesByMode: RouteModeResults;
  modesLoading: RouteModeLoading;
  activeIndexByMode: RouteModeActiveIndex;
  onSelectAlternative: (mode: TravelMode, index: number) => void;
  onClose: () => void;
}

const TABS: { mode: TravelMode; icon: string }[] = [
  { mode: 'driving', icon: 'directions-car' },
  { mode: 'motorcycle', icon: 'directions-bike' },
  { mode: 'walking', icon: 'directions-walk' },
];

const HEADER_KEY_BY_MODE: Record<TravelMode, string> = {
  driving: 'routeResult.header.driving',
  motorcycle: 'routeResult.header.motorcycle',
  walking: 'routeResult.header.walking',
};

const MANEUVER_KEY_BY_TYPE: Record<number, string> = {
  0: 'turnLeft',
  1: 'turnRight',
  2: 'turnSharpLeft',
  3: 'turnSharpRight',
  4: 'turnSlightLeft',
  5: 'turnSlightRight',
  6: 'straight',
  7: 'enterRoundabout',
  8: 'exitRoundabout',
  9: 'uturn',
  10: 'arrive',
  11: 'depart',
  12: 'keepLeft',
  13: 'keepRight',
};

const MANEUVER_ICON_BY_TYPE: Record<number, string> = {
  0: 'turn-left',
  1: 'turn-right',
  2: 'turn-sharp-left',
  3: 'turn-sharp-right',
  4: 'turn-slight-left',
  5: 'turn-slight-right',
  6: 'straight',
  7: 'rotate-right',
  8: 'rotate-right',
  9: 'u-turn-left',
  10: 'flag',
  11: 'navigation',
  12: 'turn-slight-left',
  13: 'turn-slight-right',
};

export const RouteResultSheet = forwardRef<
  BottomSheetModal,
  RouteResultSheetProps
>(
  (
    {
      pointA,
      pointB,
      selectedMode,
      onSelectMode,
      routesByMode,
      modesLoading,
      activeIndexByMode,
      onClose,
    },
    ref,
  ) => {
    const { t } = useTranslation('map');
    const { colors } = useTheme();
    const styles = useMemo(() => createRouteResultStyles(colors), [colors]);

    const [expanded, setExpanded] = useState(false);
    const snapPoints = useMemo(() => ['36%', '94%'], []);

    const alternatives = routesByMode[selectedMode];
    const activeIndex = activeIndexByMode[selectedMode];
    const activeResult = alternatives?.[activeIndex] ?? null;
    const activeLoading = modesLoading[selectedMode];

    const getStepInstruction = (step: RouteStepInfo) => {
      if (step.type === 11) return t('routeResult.maneuver.depart');
      if (step.type === 10) return t('routeResult.maneuver.arrive');

      const key = MANEUVER_KEY_BY_TYPE[step.type] ?? 'straight';
      const label = t(`routeResult.maneuver.${key}`);

      return step.name
        ? t('routeResult.ontoRoad', { direction: label, name: step.name })
        : label;
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enableOverDrag={false}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        backgroundStyle={styles.routeResultSheetBg}
        onChange={index => setExpanded(index === 1)}
        handleComponent={() => (
          <View style={styles.routeResultHandle}>
            <View style={styles.routeResultHandleBar} />

            <View style={styles.routeResultHeaderRow}>
              <Text style={styles.routeResultHeaderTitle}>
                {t(HEADER_KEY_BY_MODE[selectedMode])}
              </Text>

              <TouchableOpacity
                style={styles.routeResultCloseBtn}
                activeOpacity={0.7}
                onPress={onClose}
              >
                <Icon name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      >
        <View style={styles.routeResultContent}>
          {/* TABS */}
          <View style={styles.routeResultTabsRow}>
            {TABS.map(({ mode, icon }) => {
              const isActive = mode === selectedMode;
              const modeAlternatives = routesByMode[mode];
              const result = modeAlternatives?.[0] ?? null;
              const loading = modesLoading[mode];

              const label = result
                ? formatRouteDuration(result.durationSeconds)
                : loading
                ? '···'
                : '--';

              return (
                <TouchableOpacity
                  key={mode}
                  style={styles.routeResultTab}
                  activeOpacity={0.7}
                  onPress={() => onSelectMode(mode)}
                >
                  <Icon
                    name={icon}
                    size={20}
                    color={isActive ? colors.primary : colors.textSec}
                  />

                  <Text
                    style={[
                      styles.routeResultTabLabel,
                      isActive && styles.routeResultTabLabelActive,
                    ]}
                  >
                    {label}
                  </Text>

                  {isActive && <View style={styles.routeResultTabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SUMMARY */}
          <View style={styles.routeResultSummary}>
            {activeResult ? (
              <Text style={styles.routeResultDuration}>
                {formatRouteDuration(activeResult.durationSeconds)}{' '}
                <Text style={styles.routeResultDistance}>
                  ({formatRouteDistance(activeResult.distanceMeters)})
                </Text>
              </Text>
            ) : (
              <Text style={styles.routeResultEmptyText}>
                {activeLoading
                  ? t('routePanel.findingRoute')
                  : t('routeResult.unavailable')}
              </Text>
            )}
          </View>

          {activeResult && (
            <BottomSheetFlatList
              style={styles.routeResultStepsScroll}
              contentContainerStyle={styles.routeResultStepsContent}
              data={activeResult.steps}
              keyExtractor={(_, index) => `step-${index}`}
              ListHeaderComponent={
                <>
                  <Text style={styles.routeResultStepsTitle}>
                    {t('routeResult.stepsTitle')}
                  </Text>

                  <View style={styles.routeResultEndpointRow}>
                    {pointA?.isMyLocation ? (
                      <View style={routeMarkerStyles.dotOuter}>
                        <View style={routeMarkerStyles.panelDotBlue} />
                      </View>
                    ) : (
                      <View style={routeMarkerStyles.panelDot} />
                    )}

                    <Text
                      style={styles.routeResultEndpointText}
                      numberOfLines={1}
                    >
                      {pointA?.isMyLocation
                        ? t('routePanel.yourLocation')
                        : pointA?.name ?? ''}
                    </Text>
                  </View>
                </>
              }
              renderItem={({ item: step }) => (
                <View style={styles.routeResultStepRow}>
                  <View style={styles.routeResultStepIconWrap}>
                    <Icon
                      name={MANEUVER_ICON_BY_TYPE[step.type] ?? 'straight'}
                      size={16}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.routeResultStepContent}>
                    <Text style={styles.routeResultStepName}>
                      {getStepInstruction(step)}
                    </Text>

                    <Text style={styles.routeResultStepMeta}>
                      {formatRouteDuration(step.durationSeconds)} (
                      {formatRouteDistance(step.distanceMeters)})
                    </Text>
                  </View>
                </View>
              )}
              ListFooterComponent={
                <View style={styles.routeResultEndpointRow}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color={pointB?.isMyLocation ? colors.primary : COLORS.error}
                  />

                  <Text
                    style={styles.routeResultEndpointText}
                    numberOfLines={1}
                  >
                    {pointB?.isMyLocation
                      ? t('routePanel.yourLocation')
                      : pointB?.name ?? ''}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </BottomSheetModal>
    );
  },
);

RouteResultSheet.displayName = 'RouteResultSheet';

const createRouteResultStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    routeResultSheetBg: {
      backgroundColor: colors.surface,
    },
    routeResultHandle: {
      paddingTop: 7.5,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      overflow: 'hidden',
    },
    routeResultHandleBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.gray,
      alignSelf: 'center',
      marginBottom: 8,
    },
    routeResultHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    routeResultHeaderTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'left',
    },
    routeResultCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    routeResultTabsRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 16,
    },
    routeResultTab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      gap: 4,
    },
    routeResultTabLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSec,
    },
    routeResultTabLabelActive: {
      color: colors.primary,
    },
    routeResultTabUnderline: {
      position: 'absolute',
      bottom: -1,
      height: 2,
      width: '60%',
      backgroundColor: colors.primary,
      borderRadius: 1,
    },
    routeResultContent: {
      flex: 1,
      minHeight: 0,
    },
    routeResultSummary: {
      paddingTop: 8,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    routeResultAltRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    routeResultAltChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    routeResultAltChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '1A',
    },
    routeResultAltChipText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSec,
    },
    routeResultAltChipSubtext: {
      fontSize: 11,
      fontWeight: '400',
      color: colors.textSec,
    },
    routeResultAltChipTextActive: {
      color: colors.primary,
    },
    routeResultDuration: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    routeResultDistance: {
      fontSize: 15,
      fontWeight: '400',
      color: colors.textSec,
    },
    routeResultEmptyText: {
      fontSize: 14,
      color: colors.textSec,
    },
    routeResultStepsScroll: {
      flex: 1,
      minHeight: 0,
    },
    routeResultStepsContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    routeResultStepsTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    routeResultEndpointRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
    },
    routeResultEndpointText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    routeResultStepRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    routeResultStepIconWrap: {
      width: 20,
      alignItems: 'center',
      paddingTop: 2,
    },
    routeResultStepContent: {
      flex: 1,
    },
    routeResultStepName: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 2,
    },
    routeResultStepMeta: {
      fontSize: 12,
      color: colors.textSec,
    },
    routeResultStepsHidden: {
      opacity: 0,
    },
  });
