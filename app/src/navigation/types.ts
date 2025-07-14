// app/src/navigation/types.ts
import { ChildProfile } from '../models/types'

// Navigation parameter list for the app
export type RootStackParamList = {
  Login: undefined
  SignUp: undefined
  ForgotPassword: undefined
  Onboarding: undefined

  ProfileSelector: undefined
  Home: undefined
  Instructions: undefined
  AddChild: { profileToEdit?: ChildProfile }
  MyAccount: undefined

  /**
   * Session screen expects either an explicit overrideWeek or a calculated term/week
   * - overrideWeek: single number to force a specific week
   * - term & week: structured term/week navigation
   */
  Session: {
    overrideWeek?: number
    term?: number
    week?: number
  }

  Progress: undefined
  Curriculum: undefined
  SessionComplete: undefined

  // Paywall screen route for gating premium content
  Paywall: { term: number; week: number }
}
