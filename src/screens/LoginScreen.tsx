import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {authorize, AuthorizeResult} from 'react-native-app-auth';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your OAuth configuration
const config = {
  clientId: `${process.env.MOBILE_APP_CLIENT_ID}`,
  clientSecret: `${process.env.MOBILE_APP_CLIENT_SECRET}`,
  redirectUrl: `${process.env.MOBILE_APP_CLIENT_URL}/oauth/callback`,
  scopes: ['openid', 'profile'],
  serviceConfiguration: {
    authorizationEndpoint: `${process.env.MOBILE_APP_SERVER_URL}/oauth2/authorize`,
    tokenEndpoint: `${process.env.MOBILE_APP_SERVER_URL}/oauth2/token`,
  },
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [authResult, setAuthResult] = useState<AuthorizeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuthSession = async () => {
    try {
      await AsyncStorage.clear();
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        console.log('Access Token found, navigating to Home screen.');
        navigation.navigate('Home');
      } else {
        console.log('No Access Token found, starting login process.');
        handleLogin(); // Trigger login if no token
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false); // In case of error, stop the loading spinner
    }
  };

  const handleLogin = async () => {
    try {
      console.log('OAuth configuration:', config);
      const result = await authorize(config);
      console.log('Authentication result:', result);
      setAuthResult(result);

      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('refreshToken', result.refreshToken || '');
      await AsyncStorage.setItem(
        'accessTokenExpirationDate',
        result.accessTokenExpirationDate || '',
      );
      await AsyncStorage.setItem('idToken', result.idToken || '');
      await AsyncStorage.setItem('tokenType', result.tokenType || '');
      await AsyncStorage.setItem('scopes', JSON.stringify(result.scopes || []));

      navigation.navigate('Home');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false); // Ensure loading stops after login
    }
  };

  // Use useFocusEffect to run the checkAuthSession when the screen is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true); // Start loading when screen is focused
      checkAuthSession(); // Check if the user is authenticated when the component is focused
    }, []),
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-purple-700 via-indigo-500 to-blue-400">
        <ActivityIndicator size="large" color="#ffffff" className="mb-5" />
        <Text className="text-black text-2xl font-bold tracking-wide">
          Checking your session...
        </Text>
        <Text className="text-black text-lg font-light mt-4 text-center">
          Please wait, we're making sure everything is ready for you!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-purple-500 to-indigo-500">
      <ScrollView className="py-5">
        <View className="bg-white p-4 rounded-lg shadow-lg">
          <Text className="text-2xl font-extrabold text-center text-gray-800 mb-4">
            Login with OAuth 2.0
          </Text>
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-purple-600 px-6 py-3 rounded-full shadow-md">
            <Text className="text-white text-center">Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
