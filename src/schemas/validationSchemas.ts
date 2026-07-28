import { MAX_MEDIA } from '@/constants/constants';
import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, { message: 'validation.rating.required' })
    .max(5, { message: 'validation.rating.max' }),
  comment: z
    .string()
    .min(1, { message: 'validation.comment.required' })
    .min(10, { message: 'validation.comment.minLength' })
    .max(1000, { message: 'validation.comment.maxLength' }),
  media: z
    .array(
      z.object({
        uri: z.string(),
        type: z.enum(['image', 'video']),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        duration: z.number().optional(),
      }),
    )
    .max(MAX_MEDIA, { message: 'validation.media.max' }),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
