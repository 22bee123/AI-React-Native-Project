import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the splash screen (screen.js in pages folder)
  return <Redirect href="/pages/screen" />;
}
