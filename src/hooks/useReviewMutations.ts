import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@/store/api/placeDetailApi';
import type { Review } from '@/types/placeDetail.types';
import type { MediaItem } from '@/types/reviewListScreen.types';

export const useReviewMutations = (osmId: string) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [createReview, { isLoading: submitting }] = useCreateReviewMutation();
  const [updateReview, { isLoading: updating }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const handleCreate = useCallback(
    async (rating: number, comment: string, media: MediaItem[]) => {
      if (!user) return;
      await createReview({
        osmId,
        userId: user.id,
        rating,
        comment,
        mediaUrls: media.map(m => m.uri),
        mediaTypes: media.map(m => m.type),
        createdAt: new Date().toISOString(),
      });
    },
    [user, osmId, createReview],
  );

  const handleUpdate = useCallback(
    async (rating: number, comment: string, media: MediaItem[]) => {
      if (!editingReview) return;
      await updateReview({
        id: editingReview.id,
        osmId: editingReview.osmId,
        rating,
        comment,
        mediaUrls: media.map(m => m.uri),
        mediaTypes: media.map(m => m.type),
        createdAt: new Date().toISOString(),
      });
      setEditingReview(null);
    },
    [editingReview, updateReview],
  );

  const handleDelete = useCallback(
    async (id: string, reviewUserId: string) => {
      await deleteReview({ id, osmId, userId: reviewUserId });
    },
    [deleteReview, osmId],
  );

  const handleEditStart = useCallback((item: Review) => {
    setEditingReview(item);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingReview(null);
  }, []);

  return {
    user,
    editingReview,
    submitting,
    updating,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleEditStart,
    handleEditCancel,
  };
};
