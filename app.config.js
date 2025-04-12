module.exports = () => {
  const isDev = true;
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
      firebaseApiKey: 'AIzaSyC5xeeWjT3XpPMPamhSc748D9Bbif0RhzM',
      firebaseAuthDomain: 'aurora-baby-mobile.firebaseapp.com',
      firebaseProjectId: 'aurora-baby-mobile',
      firebaseStorageBucket: 'aurora-baby-mobile.appspot.com', // Fixed typo: firebasestorage.app -> appspot.com
      firebaseMessagingSenderId: '450824864919',
      firebaseAppId: '1:450824864919:web:39dc697565b309cb4ed5d2',
      firebaseMeasurementId: 'G-DF2KM62PL6',
      googleWebClientId: '450824864919-2f0636shfkbv7ivr4nhjloiljs5r6tc9.apps.googleusercontent.com',
      isDev: isDev
    },
    newArchEnabled: true 
  };
};