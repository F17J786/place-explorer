import React, { useMemo, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  FlatList,
  StatusBar,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import ImageViewing from 'react-native-image-viewing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.28)',
  overlayDark: 'rgba(0,0,0,0.85)',
};

// ── helpers ───────────────────────────────────────────────────────────────────
const getImageFull = (url: string) =>
  url.replace('/image/upload/', '/image/upload/q_auto,f_auto/');

const getImageThumbnail = (url: string, width = 300) =>
  url.replace(
    '/image/upload/',
    `/image/upload/w_${width},h_${width},c_fill,q_auto,f_auto/`,
  );

const getVideoThumbnail = (videoUrl: string) =>
  videoUrl
    .replace('/video/upload/', '/video/upload/so_0/')
    .replace(/\.[^/.]+$/, '.jpg');

// ── VideoFullscreen ───────────────────────────────────────────────────────────
// Modal riêng cho video vì ImageViewing không handle video

const VideoFullscreen = ({
  url,
  visible,
  onClose,
}: {
  url: string;
  visible: boolean;
  onClose: () => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <StatusBar hidden />
    <View style={styles.videoModal}>
      <Video
        source={{ uri: url }}
        style={styles.videoFullscreen}
        resizeMode="contain"
        controls
        onEnd={onClose}
        onError={onClose}
      />
      <TouchableOpacity style={styles.videoCloseBtn} onPress={onClose}>
        <Icon name="close" size={26} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  </Modal>
);

// ── MediaLightbox ─────────────────────────────────────────────────────────────
// Quản lý state lightbox cho cả list media (ảnh + video mixed)

export const MediaLightbox = ({
  mediaUrls,
  mediaTypes,
  initialIndex,
  visible,
  onClose,
}: {
  mediaUrls: string[];
  mediaTypes: ('image' | 'video')[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [videoVisible, setVideoVisible] = useState(
    mediaTypes[initialIndex] === 'video', // nếu bấm thẳng vào video thì mở luôn
  );

  const images = useMemo(
    () =>
      mediaUrls.map((url, i) =>
        mediaTypes[i] === 'video'
          ? { uri: getVideoThumbnail(url) }
          : { uri: getImageFull(url) },
      ),
    [mediaUrls, mediaTypes],
  );

  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    if (mediaTypes[index] === 'video') {
      setVideoVisible(true); // tự động mở video khi vuốt tới
    }
  };

  return (
    <>
      <ImageViewing
        images={images}
        imageIndex={initialIndex}
        visible={visible && !videoVisible}
        onRequestClose={onClose}
        onImageIndexChange={handleIndexChange}
        presentationStyle="overFullScreen"
      />

      <VideoFullscreen
        url={mediaUrls[currentIndex]}
        visible={visible && videoVisible}
        onClose={() => {
          setVideoVisible(false);
          // nếu list chỉ có video thì đóng hẳn lightbox
          if (mediaTypes.every(t => t === 'video')) {
            onClose();
          }
        }}
      />
    </>
  );
};

// ── MediaThumb ────────────────────────────────────────────────────────────────

const MediaThumb = ({
  url,
  type,
  onPress,
}: {
  url: string;
  type: 'image' | 'video';
  onPress: () => void;
}) => {
  const [thumbError, setThumbError] = useState(false);

  const thumbUri =
    type === 'video' ? getVideoThumbnail(url) : getImageThumbnail(url);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      {thumbError ? (
        <View style={[styles.mediaThumb, styles.videoThumbFallback]}>
          <Icon name="videocam" size={28} color={COLORS.white} />
        </View>
      ) : (
        <Image
          source={{ uri: thumbUri }}
          style={styles.mediaThumb}
          onError={e => {
            console.log('image load error:', url, e.nativeEvent.error);
            setThumbError(true);
          }}
        />
      )}
      {type === 'video' && (
        <View style={styles.playOverlay}>
          <Icon name="play-circle-filled" size={34} color={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default MediaThumb;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  mediaThumb: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  videoThumbFallback: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.overlay,
    borderRadius: 8,
  },

  // Video modal
  videoModal: {
    flex: 1,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoFullscreen: {
    width: SCREEN_W,
    height: SCREEN_H * 0.6,
  },
  videoCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },

  // Lightbox footer
  lightboxFooter: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  lightboxPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  lightboxPlayText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
