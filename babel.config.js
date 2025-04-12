module.exports = {
  presets: [['module:@react-native/babel-preset', {
    useTransformReactJSXExperimental: true,
    unstable_transformProfile: 'hermes-stable'
  }]],
  plugins: [
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    'react-native-reanimated/plugin' 
  ]
};