export interface DefaultUserInfo {
  email: string;
  password: string;
}

export interface SignUpUserInfo extends DefaultUserInfo {
  nickname: string;
}
