import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import CountryFlag from 'react-native-country-flag';

import { COLORS } from '@/constants/constants';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/locales';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

interface LanguagePickerSheetProps {
  currentLanguage: SupportedLanguage;
  onSelect: (lang: SupportedLanguage) => void;
}

export const LanguagePickerSheet = forwardRef<
  BottomSheetModal,
  LanguagePickerSheetProps
>(({ currentLanguage, onSelect }, ref) => {
  const snapPoints = useMemo(() => ['18%'], []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
      enableContentPanningGesture={false}
      enableHandlePanningGesture={false}
      enableOverDrag={false}
      enableDismissOnClose={true}
      handleStyle={styles.bsHandle}
      handleIndicatorStyle={styles.bsHandleBar}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView style={styles.container}>
        {SUPPORTED_LANGUAGES.map(lang => {
          return (
            <TouchableOpacity
              key={lang}
              style={styles.option}
              onPress={() => onSelect(lang)}
              activeOpacity={0.6}
            >
              <View style={styles.flagWrapper}>
                <CountryFlag isoCode={lang === 'en' ? 'gb' : 'vn'} size={23} />
              </View>
              <Text style={styles.optionLabel}>{LANGUAGE_LABELS[lang]}</Text>
            </TouchableOpacity>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

LanguagePickerSheet.displayName = 'LanguagePickerSheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bsHandle: {
    paddingTop: 7.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLabel: {
    fontSize: 15,
    color: COLORS.text,
  },
  optionLabelSelected: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bsHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray,
    alignSelf: 'center',
    marginBottom: 2,
  },
  flagWrapper: {
    width: 21,
    height: 21,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
