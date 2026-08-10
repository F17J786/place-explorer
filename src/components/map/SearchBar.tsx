import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { getConfig } from '@/constants/constants';
import { SearchSuggestion } from '@/types/mapScreen.type';
import { useMapScreenStyles } from '@/hooks/useMapScreenStyles';

interface SearchBarProps {
  searchQuery: string;
  searchFocused: boolean;
  suggestions: SearchSuggestion[];
  searchLoading: boolean;
  resultCount: number;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onClear: () => void;
  onSelectSuggestion: (s: SearchSuggestion) => void;
  onOpenRoutePanel: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  searchFocused,
  suggestions,
  searchLoading,
  resultCount,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  onSelectSuggestion,
  onOpenRoutePanel,
}) => {
  const { styles, colors } = useMapScreenStyles();
  const { t } = useTranslation('map');
  const showSuggestions =
    searchFocused && (suggestions.length > 0 || searchLoading);

  return (
    <View style={styles.topBar}>
      <View style={styles.searchRow}>
        <View
          style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}
        >
          <Icon
            name="search"
            size={18}
            color={searchFocused ? colors.primary : colors.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchBar.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={onClear}>
              <Icon name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statsValue}>{resultCount}</Text>
          <Text style={styles.statsLabel}>{t('searchBar.displayLabel')}</Text>
        </View>
        <TouchableOpacity
          style={styles.routeToggleBtn}
          onPress={onOpenRoutePanel}
        >
          <Icon name="directions" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showSuggestions && (
        <View style={styles.suggestionList}>
          {searchLoading && (
            <View style={styles.suggestLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.suggestLoadingText}>
                {t('searchBar.searching')}
              </Text>
            </View>
          )}
          {suggestions.map(s => (
            <TouchableOpacity
              key={s.id}
              style={styles.suggestionItem}
              onPress={() => onSelectSuggestion(s)}
            >
              <View
                style={[
                  styles.suggestIcon,
                  {
                    backgroundColor:
                      s.type === 'marker'
                        ? colors.primaryLight
                        : colors.surfaceMuted,
                  },
                ]}
              >
                <Icon
                  name={
                    s.type === 'marker'
                      ? getConfig(s.amenity ?? '').icon
                      : 'place'
                  }
                  size={14}
                  color={s.type === 'marker' ? colors.primary : colors.textSec}
                />
              </View>
              <View style={styles.suggestTextWrap}>
                <Text style={styles.suggestName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.suggestSub} numberOfLines={1}>
                  {s.displayName}
                </Text>
              </View>
              <Icon name="north-west" size={12} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
