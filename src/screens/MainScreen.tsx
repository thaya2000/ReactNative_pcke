import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authorize, logout} from 'react-native-app-auth';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

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

interface AuthResult {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpirationDate: string | null;
  tokenType: string | null;
  scopes: string[] | null;
  idToken: string | null;
}

const MainScreen: React.FC = () => {
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to check the auth session from AsyncStorage
  const checkAuthSession = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const accessTokenExpirationDate = await AsyncStorage.getItem(
        'accessTokenExpirationDate',
      );
      const tokenType = await AsyncStorage.getItem('tokenType');
      const scopes = await AsyncStorage.getItem('scopes');
      const idToken = await AsyncStorage.getItem('idToken');

      if (accessToken) {
        setAuthResult({
          accessToken,
          refreshToken,
          accessTokenExpirationDate,
          tokenType,
          scopes: scopes ? JSON.parse(scopes) : null,
          idToken,
        });
      } else {
        setAuthResult(null);
        handleLogin();
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await authorize(config);
      setAuthResult(result);
      await AsyncStorage.setItem('accessToken', result.accessToken || '');
      await AsyncStorage.setItem('refreshToken', result.refreshToken || '');
      await AsyncStorage.setItem(
        'accessTokenExpirationDate',
        result.accessTokenExpirationDate || '',
      );
      await AsyncStorage.setItem('idToken', result.idToken || '');
      await AsyncStorage.setItem('tokenType', result.tokenType || '');
      await AsyncStorage.setItem('scopes', JSON.stringify(result.scopes || []));
    } catch (error) {
      console.error('Login failed:', error);
      handleLogin();
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      if (!authResult?.idToken) {
        console.error('No idToken found for logout.');
        return;
      }

      const config = {
        issuer: `${process.env.MOBILE_APP_SERVER_URL}`,
      };

      await logout(
        {...config, clientId: `${process.env.MOBILE_APP_CLIENT_ID}`},
        {
          idToken: authResult.idToken,
          postLogoutRedirectUrl: `${process.env.MOBILE_APP_CLIENT_URL}//logout-callback`,
        },
      );
      handleLogin();
      await AsyncStorage.clear();
      setAuthResult(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect to check authentication status every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      checkAuthSession();
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

  if (!authResult || !authResult.accessToken) {
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
  } else {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-500 to-blue-300 p-4">
        <ScrollView className="py-5">
          <View className="flex justify-center items-center">
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500 px-6 py-3 rounded-full shadow-lg mb-6">
              <Text className="text-white text-center">Logout</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white p-6 rounded-lg shadow-lg mb-4 border border-gray-200">
            <Text className="text-2xl text-black font-extrabold mb-4 text-center">
              Authentication Details
            </Text>

            <View className="mb-3">
              <Text className="text-lg font-semibold text-blue-700 mb-1">
                Access Token:
              </Text>
              <Text className="text-gray-700 break-words">
                {authResult.accessToken || 'N/A'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-lg font-semibold text-blue-700 mb-1">
                Token Type:
              </Text>
              <Text className="text-gray-700">
                {authResult.tokenType || 'N/A'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-lg font-semibold text-blue-700 mb-1">
                Expires In:
              </Text>
              <Text className="text-gray-700">
                {authResult.accessTokenExpirationDate || 'N/A'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-lg font-semibold text-blue-700 mb-1">
                Refresh Token:
              </Text>
              <Text className="text-gray-700 break-words">
                {authResult.refreshToken || 'N/A'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-lg font-semibold text-blue-700 mb-1">
                Scope:
              </Text>
              <Text className="text-gray-700">
                {authResult.scopes ? authResult.scopes.join(', ') : 'N/A'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
};

export default MainScreen;
