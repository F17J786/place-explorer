import { toast } from '@baronha/ting';

export const showToast = (msg: string) => {
  toast({
    title: msg,
    preset: 'none',
    duration: 2,
    position: 'bottom',
    backgroundColor: '#000000',
    titleColor: '#FFFFFF',
  });
};
