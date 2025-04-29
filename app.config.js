module.exports = () => {
  const isDev = process.env.NODE_ENV !== 'production'; // or read from .env via dotenv
  return {
    name: 'aurora-baby-mobile',
    version: '1.0.0',
    slug: 'aurora-baby-mobile',
    android: {
      package: 'com.miladarbabi.aurorababymobile'
    },
    ios: {
      bundleIdentifier: 'com.miladarbabi.aurorababymobile'
    },
    extra: {
      apiHost: isDev
      ? 'http://10.0.2.2:4000'
      : 'https://your.production.api',
      firebaseApiKey: 'AIzaSyC5xeeWjT3XpPMPamhSc748D9Bbif0RhzM',
      firebaseAuthDomain: 'aurora-baby-mobile.firebaseapp.com',
      firebaseProjectId: 'aurora-baby-mobile',
      firebaseStorageBucket: 'aurora-baby-mobile.appspot.com', // Fixed typo: firebasestorage.app -> appspot.com
      firebaseMessagingSenderId: '450824864919',
      firebaseAppId: '1:450824864919:web:39dc697565b309cb4ed5d2',
      firebaseMeasurementId: 'G-DF2KM62PL6',
      googleWebClientId: '450824864919-2f0636shfkbv7ivr4nhjloiljs5r6tc9.apps.googleusercontent.com',
      isDev: false
    },
    newArchEnabled: true,
    }
  };