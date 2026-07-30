import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import CountryFlag from 'react-native-country-flag';
import i18n from 'i18next';

import { COLORS } from '@/constants/constants';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/locales';
import { showToast } from '@/utils/toast';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

interface LanguagePickerSheetProps {
  currentLanguage: SupportedLanguage;
  onSelect: (lang: SupportedLanguage) => void;
  isKeyboardOpen?: boolean;
}

export const LanguagePickerSheet = forwardRef<
  BottomSheetModal,
  LanguagePickerSheetProps
>(({ currentLanguage, onSelect }, ref) => {
  const handleSelect = (lang: SupportedLanguage) => {
    if (lang === currentLanguage) {
      onSelect(lang);
      return;
    }

    // Dịch message theo đúng ngôn ngữ MỚI được chọn (lng: lang),
    // không phụ thuộc i18n.language hiện tại — tránh race condition với changeLanguage() bất đồng bộ
    const message = i18n.t('common:languageChanged', {
      language: LANGUAGE_LABELS[lang],
      lng: lang,
    });

    onSelect(lang);
    showToast(message);
  };

  return (
    <BottomSheetModal
      ref={ref}
      enableContentPanningGesture={false}
      enableHandlePanningGesture={false}
      enableOverDrag={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      handleStyle={styles.bsHandle}
      backgroundStyle={styles.bsBackground}
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
              onPress={() => handleSelect(lang)}
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
    paddingBottom: 24,
    gap: 6,
  },
  bsHandle: {
    paddingTop: 7.5,
  },
  bsBackground: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
