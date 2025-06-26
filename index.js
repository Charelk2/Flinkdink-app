import { AppRegistry } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Explicitly register both "main" and "auth" entry points. This covers
// cases where native projects still reference the deprecated "auth"
// component name. We also register "main" directly to guard against
// environments that bypass Expo's helper.
AppRegistry.registerComponent('main', () => App);
AppRegistry.registerComponent('auth', () => App);

registerRootComponent(App);
