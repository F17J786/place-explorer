import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/constants';
import { OsmMarker } from '@/types/mapScreen.type';
import { styles } from '@/constants/stylesMapScreen';
import { MarkerRow } from './MarkerRow';

interface PlaceListSheetProps {
  markers: OsmMarker[];
  loading: boolean;
  selectedAmenity: string;
  onSelectMarker: (item: OsmMarker) => void;
}

export const PlaceListSheet: React.FC<PlaceListSheetProps> = ({
  markers,
  loading,
  selectedAmenity,
  onSelectMarker,
}) => {
  const { t } = useTranslation('map');

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.sheetHeader}>
        <View style={styles.sheetHeaderTitleRow}>
          <Icon name="place" size={20} color={COLORS.primary} />
          <Text style={styles.sheetTitle}>{t('placeList.title')}</Text>
        </View>
        <View style={styles.liveChip}>
          <Text style={styles.liveText}>{'LIVE\nFEED'}</Text>
        </View>
      </View>

      {markers.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Icon name="zoom-in" size={32} color="#CBD5E1" />
          <Text style={styles.emptyText}>
            {selectedAmenity
              ? t('placeList.emptyInArea')
              : t('placeList.selectCategory')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={markers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectMarker(item)}>
              <MarkerRow item={item} />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};
