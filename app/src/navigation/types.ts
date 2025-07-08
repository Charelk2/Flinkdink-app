// app/src/navigation/types.ts
import { ChildProfile } from '../models/types'

export type RootStackParamList = {
  Login: undefined
  SignUp: undefined
  ForgotPassword: undefined
  Onboarding: undefined
  ProfileSelector: undefined
  AddChild: { profileToEdit?: ChildProfile }
  Home: undefined
  MyAccount: undefined
  Session: { overrideWeek?: number }
  Progress: undefined
  Curriculum: undefined
  SessionComplete: undefined
  Instructions: undefined;
}
