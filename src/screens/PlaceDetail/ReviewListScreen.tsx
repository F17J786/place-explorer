import React, { useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { FlatList, Text } from 'react-native';
import { ReviewListRoutePropType } from '@/types/navigation';
import { useGetReviewsByOsmIdQuery } from '@/store/api/placeDetailApi';
import { COLORS } from '@/constants/constantsReviewListScreen';
import { styles } from '@/constants/stylesReviewListScreen';
import { useReviewFilters } from '@/hooks/useReviewFilters';
import { useReviewMutations } from '@/hooks/useReviewMutations';
import { ReviewItem } from '@/components/reviewlist/ReviewItem';
import { ReviewListHeader } from '@/components/reviewlist/ReviewListHeader';
import { FilterBottomSheet } from '@/components/reviewlist/FilterBottomSheet';

export const ReviewListScreen = () => {
  const route = useRoute<ReviewListRoutePropType>();
  const { osmId } = route.params;

  const filterBsRef = useRef<BottomSheetModal>(null);

  const { data: reviews = [], isLoading } = useGetReviewsByOsmIdQuery(osmId);

  const {
    activeFilter,
    setActiveFilter,
    filteredReviews,
    avgRating,
    ratingDist,
  } = useReviewFilters(reviews);

  const {
    user,
    editingReview,
    submitting,
    updating,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleEditStart,
    handleEditCancel,
  } = useReviewMutations(osmId);

  const isLoggedIn = !!user;
  const myReview = user
    ? reviews.find(r => String(r.userId) === user.id)
    : undefined;
  const showCreateForm = isLoggedIn && !myReview && !editingReview;
  const showEditForm = !!editingReview;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredReviews}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ReviewListHeader
            reviews={reviews}
            avgRating={avgRating}
            ratingDist={ratingDist}
            showCreateForm={showCreateForm}
            showEditForm={showEditForm}
            editingReview={editingReview}
            submitting={submitting}
            updating={updating}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onEditCancel={handleEditCancel}
            activeFilter={activeFilter}
            onOpenFilter={() => filterBsRef.current?.present()}
            onClearFilter={() => setActiveFilter('newest')}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              color={COLORS.primary}
              size="large"
              style={styles.emptyLoading}
            />
          ) : (
            <View style={styles.empty}>
              <Icon2
                name="comment-text-outline"
                size={52}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
              {!isLoggedIn && (
                <Text style={styles.emptyText}>Đăng nhập để viết đánh giá</Text>
              )}
            </View>
          )
        }
        renderItem={({ item }) => (
          <ReviewItem
            item={item}
            currentUserId={user?.id}
            onEdit={handleEditStart}
            onDelete={handleDelete}
          />
        )}
      />

      <FilterBottomSheet
        ref={filterBsRef}
        activeFilter={activeFilter}
        onApply={setActiveFilter}
      />
    </View>
  );
};
