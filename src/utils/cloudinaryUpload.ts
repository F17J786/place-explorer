import axios from 'axios';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '@/constants/constants';

export const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `image_${Date.now()}.jpg`,
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'works/images');
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.secure_url;
};

export const uploadVideoToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'video/mp4',
    name: `video_${Date.now()}.mp4`,
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'works/videos');
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.secure_url;
};
