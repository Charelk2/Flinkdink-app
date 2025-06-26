import { AppRegistry } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Register both 'main' and 'auth' component names to avoid runtime
// "Component ... has not been registered yet" errors on native builds.
// Some older configuration may look for the "auth" root, while Expo
// expects "main". Registering both ensures compatibility.
AppRegistry.registerComponent('auth', () => App);
registerRootComponent(App);
