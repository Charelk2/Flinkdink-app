//app/src/navigation/types.ts

import { ChildProfile } from '../models/types'; // ✅ relative path from navigation to models

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  ProfileSelector: undefined;
  AddChild: { profileToEdit?: ChildProfile }; // ✅ this now works!
  Home: undefined;
  MyAccount: undefined;
  Session: { overrideWeek?: number }; // ✅ added overrideWeek
  Progress: undefined;
  Curriculum: undefined;
  SessionComplete: undefined; 
};
