import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {authorize, AuthorizeResult} from 'react-native-app-auth';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your OAuth configuration
const config = {
  clientId: `${process.env.MOBILE_APP_CLIENT_ID}`,
  clientSecret: `${process.env.MOBILE_APP_CLIENT_SECRET}`,
  redirectUrl: `${process.env.MOBILE_APP_CLIENT_URL}/oauth/callback`,
  scopes: ['openid', 'profile'],
  serviceConfiguration: {
    authorizationEndpoint: `${process.env.MOBILE_APP_SERVER_URL}/oauth2/authorize`,
    // authorizationEndpoint:
    //   'https://66f4-112-135-30-220.ngrok-free.app/oauth2/authorize',
    tokenEndpoint: `${process.env.MOBILE_APP_SERVER_URL}/oauth2/token`,
    // tokenEndpoint: 'https://66f4-112-135-30-220.ngrok-free.app/oauth2/token',
  },
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [authResult, setAuthResult] = useState<AuthorizeResult | null>(null);

  const handleLogin = async () => {
    try {
      console.log('config : ', config);
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
    }
  };

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

          {/* {authResult && (
            <View className="bg-white p-6 rounded-lg shadow-lg my-4 border border-gray-200">
              <Text className="text-lg text-gray-800 font-semibold mb-2 text-center">
                Authentication Result
              </Text>
              <View className="bg-gray-100 p-4 rounded-lg">
                <Text className="text-gray-700 mb-2">
                  <Text className="font-semibold">Access Token:</Text>{' '}
                  {authResult.accessToken || 'N/A'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <Text className="font-semibold">Token Type:</Text>{' '}
                  {authResult.tokenType || 'N/A'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <Text className="font-semibold">Expires In:</Text>{' '}
                  {authResult.accessTokenExpirationDate || 'N/A'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <Text className="font-semibold">Refresh Token:</Text>{' '}
                  {authResult.refreshToken || 'N/A'}
                </Text>
                <Text className="text-gray-700">
                  <Text className="font-semibold">Scope:</Text>{' '}
                  {authResult.scopes ? authResult.scopes.join(', ') : 'N/A'}
                </Text>
              </View>
            </View>
          )} */}
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
