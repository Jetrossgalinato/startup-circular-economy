export type UserRole = 'resident' | 'admin' | 'collector'

export type Profile = {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}

export type SignUpInput = {
  email: string
  password: string
  fullName: string
  role: UserRole
}

export type SignInInput = {
  email: string
  password: string
}

export type RoleOption = {
  value: UserRole
  label: string
}

export type RegisterFormValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role?: UserRole
}

export type LoginFormValues = {
  email: string
  password: string
}
