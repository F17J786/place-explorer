import { MAX_MEDIA } from '@/screens/PlaceDetail/ReviewListScreen';
import { z } from 'zod';
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao').max(5, 'Tối đa 5 sao'),
  comment: z
    .string()
    .min(1, 'Vui lòng nhập nhận xét')
    .min(10, 'Nhận xét tối thiểu 10 ký tự')
    .max(1000, 'Nhận xét tối đa 1000 ký tự'),
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
    .max(MAX_MEDIA, `Tối đa ${MAX_MEDIA} ảnh/video`),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
