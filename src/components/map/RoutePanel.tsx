import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/constants/constants';
import { SearchSuggestion } from '@/types/mapScreen.type';
import { styles } from '@/constants/stylesMapScreen';
import { routeMarkerStyles } from './RouteMarker';

interface RoutePanelProps {
  focusedInput: 'A' | 'B' | null;
  displayA: string;
  displayB: string;
  inputAText: string;
  inputBText: string;
  inputAIsMyLoc: boolean;
  inputBIsMyLoc: boolean;
  inputAFocusHide: boolean;
  inputBFocusHide: boolean;
  isTyping: boolean;
  routeCoordsEmpty: boolean;
  showRouteDropdownBase: boolean;
  showSearchResults: boolean;
  routeSuggestions: SearchSuggestion[];
  routeSuggestLoading: boolean;
  recentPoints: SearchSuggestion[];
  routeLoading: boolean;
  locating: boolean;
  onClosePanel: () => void;
  onInputFocus: (input: 'A' | 'B') => void;
  onInputBlur: (input: 'A' | 'B') => void;
  onInputChange: (text: string, input: 'A' | 'B') => void;
  onClearInputA: () => void;
  onClearInputB: () => void;
  onSwap: () => void;
  onSelectSearchResult: (s: SearchSuggestion) => void;
  onSelectRecent: (s: SearchSuggestion) => void;
  onSelectMyLocation: () => void;
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  focusedInput,
  displayA,
  displayB,
  inputAText,
  inputBText,
  inputAIsMyLoc,
  inputBIsMyLoc,
  inputAFocusHide,
  inputBFocusHide,
  isTyping,
  routeCoordsEmpty,
  showRouteDropdownBase,
  showSearchResults,
  routeSuggestions,
  routeSuggestLoading,
  recentPoints,
  routeLoading,
  locating,
  onClosePanel,
  onInputFocus,
  onInputBlur,
  onInputChange,
  onClearInputA,
  onClearInputB,
  onSwap,
  onSelectSearchResult,
  onSelectRecent,
  onSelectMyLocation,
}) => {
  const showDropdown = routeCoordsEmpty && showRouteDropdownBase;

  return (
    <View style={styles.routePanel}>
      <View style={styles.routePanelHeader}>
        <Icon name="directions" size={18} color={COLORS.primary} />
        <Text style={styles.routePanelTitle}>Chỉ đường</Text>
        <TouchableOpacity style={styles.routeCloseBtn} onPress={onClosePanel}>
          <Icon name="close" size={20} color={COLORS.textSec} />
        </TouchableOpacity>
      </View>

      <View style={styles.routeInputsWrapper}>
        <View style={styles.routeIconsCol}>
          {inputAIsMyLoc ? (
            <View style={routeMarkerStyles.dotOuter}>
              <View style={routeMarkerStyles.panelDotBlue} />
            </View>
          ) : (
            <View style={routeMarkerStyles.panelDot} />
          )}
          <View style={styles.routeDotsMiddle}>
            <View style={styles.routeDotSmall} />
            <View style={styles.routeDotSmall} />
            <View style={styles.routeDotSmall} />
          </View>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={22}
            color={inputBIsMyLoc ? COLORS.primary : COLORS.error}
          />
        </View>

        <View style={styles.routeInputsCol}>
          <View
            style={[
              styles.routeInputWrap,
              focusedInput === 'A' && styles.routeInputWrapActive,
            ]}
          >
            <TextInput
              style={[
                styles.routeInput,
                inputAIsMyLoc && !inputAFocusHide && styles.routeInputMyLoc,
              ]}
              placeholder="Chọn vị trí bắt đầu"
              placeholderTextColor={COLORS.textMuted}
              value={displayA}
              onFocus={() => onInputFocus('A')}
              onBlur={() => onInputBlur('A')}
              onChangeText={t => onInputChange(t, 'A')}
            />
            {(inputAText.length > 0 || inputAIsMyLoc) && (
              <TouchableOpacity
                style={styles.routeInputClear}
                onPress={onClearInputA}
              >
                <Icon name="cancel" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={[
              styles.routeInputWrap,
              focusedInput === 'B' && styles.routeInputWrapActive,
            ]}
          >
            <TextInput
              style={[
                styles.routeInput,
                inputBIsMyLoc && !inputBFocusHide && styles.routeInputMyLoc,
              ]}
              placeholder="Chọn điểm đến"
              placeholderTextColor={COLORS.textMuted}
              value={displayB}
              onFocus={() => onInputFocus('B')}
              onBlur={() => onInputBlur('B')}
              onChangeText={t => onInputChange(t, 'B')}
            />
            {(inputBText.length > 0 || inputBIsMyLoc) && (
              <TouchableOpacity
                style={styles.routeInputClear}
                onPress={onClearInputB}
              >
                <Icon name="cancel" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.swapBtn} onPress={onSwap}>
          <Icon name="swap-vert" size={25} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {(routeLoading || locating) && (
        <View style={styles.routeLoadingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.routeLoadingText}>
            {locating ? 'Đang lấy vị trí hiện tại...' : 'Đang tìm đường...'}
          </Text>
        </View>
      )}

      {showDropdown && (
        <View style={styles.routeDropdown}>
          {showSearchResults && (
            <>
              {routeSuggestLoading && (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={styles.suggestLoadingIndicator}
                />
              )}
              {routeSuggestions.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.dropdownItem}
                  onPress={() => onSelectSearchResult(s)}
                >
                  <View style={styles.dropdownIconWrap}>
                    <Icon name="place" size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.dropdownTextWrap}>
                    <Text style={styles.suggestName} numberOfLines={1}>
                      {s.name}
                    </Text>
                    <Text style={styles.suggestSub} numberOfLines={1}>
                      {s.displayName}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {!isTyping && (
            <>
              {!(focusedInput === 'A' && inputAIsMyLoc) &&
                !(focusedInput === 'B' && inputBIsMyLoc) && (
                  <TouchableOpacity
                    style={styles.myLocRow}
                    onPress={onSelectMyLocation}
                  >
                    <View style={styles.myLocIconWrap}>
                      <Icon
                        name="my-location"
                        size={16}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text style={styles.myLocText}>Vị trí của bạn</Text>
                  </TouchableOpacity>
                )}

              {recentPoints.length > 0 && (
                <>
                  <View style={styles.recentHeader}>
                    <Text style={styles.recentHeaderText}>Gần đây</Text>
                  </View>
                  {recentPoints.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.dropdownItem}
                      onPress={() => onSelectRecent(s)}
                    >
                      <View style={styles.dropdownIconWrap}>
                        <Icon name="history" size={16} color={COLORS.textSec} />
                      </View>
                      <View style={styles.dropdownTextWrap}>
                        <Text style={styles.suggestName} numberOfLines={1}>
                          {s.name}
                        </Text>
                        <Text style={styles.suggestSub} numberOfLines={1}>
                          {s.displayName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};
