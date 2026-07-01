export interface UpdateProfileFormValues {
  name: string;
  email: string;
  avatar: string;
}

export interface UpdateProfilePayload extends UpdateProfileFormValues {
  id: string;
}

export interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordPayload {
  id: string;
  oldPassword: string;
  newPassword: string;
}
