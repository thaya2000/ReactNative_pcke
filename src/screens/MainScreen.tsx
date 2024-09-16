import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authorize, logout, refresh} from 'react-native-app-auth';
import {useFocusEffect} from '@react-navigation/native';

import {
  MOBILE_APP_CLIENT_ID,
  MOBILE_APP_CLIENT_SECRET,
  MOBILE_APP_SERVER_URL,
  MOBILE_APP_CLIENT_URL,
} from '../utils/apiConstants';

const authorizeConfig = {
  clientId: MOBILE_APP_CLIENT_ID,
  clientSecret: MOBILE_APP_CLIENT_SECRET,
  redirectUrl: `${MOBILE_APP_CLIENT_URL}/oauth/callback`,
  scopes: ['openid', 'profile'],
  serviceConfiguration: {
    authorizationEndpoint: `${MOBILE_APP_SERVER_URL}/oauth2/authorize`,
    tokenEndpoint: `${MOBILE_APP_SERVER_URL}/oauth2/token`,
  },
};

const logoutConfig = {
  issuer: MOBILE_APP_SERVER_URL,
};

interface AuthResult {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpirationDate: string | null;
  idToken: string | null;
}

const MainScreen: React.FC = () => {
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false);

  const checkAuthSession = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const accessTokenExpirationDate = await AsyncStorage.getItem(
        'accessTokenExpirationDate',
      );

      const idToken = await AsyncStorage.getItem('idToken');

      if (accessToken) {
        setAuthResult({
          accessToken,
          refreshToken,
          accessTokenExpirationDate,
          idToken,
        });
      } else {
        setAuthResult(null);
        handleLogin();
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      console.log('authorizeConfig : ', authorizeConfig);

      const result = await authorize(authorizeConfig);
      setAuthResult(result);
      await AsyncStorage.setItem('accessToken', result.accessToken || '');
      await AsyncStorage.setItem('refreshToken', result.refreshToken || '');
      await AsyncStorage.setItem('idToken', result.idToken || '');
    } catch (error) {
      console.error('Login failed:', error);
      handleLogin();
    } finally {
      setAuthLoading(false);
    }
  };

  // Function to handle the logout
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      if (authResult && authResult.refreshToken) {
        const refreshTokenResponse = await refresh(authorizeConfig, {
          refreshToken: authResult.refreshToken,
        });
        setAuthResult(refreshTokenResponse);

        // console.log('idToken A : ', refreshTokenResponse.idToken);
        // console.log('idToken B : ', authResult.idToken);
        // console.log('Logout going to execute');

        await logout(
          {...logoutConfig, clientId: `${process.env.MOBILE_APP_CLIENT_ID}`},
          {
            idToken: refreshTokenResponse.idToken,
            postLogoutRedirectUrl: `${process.env.MOBILE_APP_CLIENT_URL}//logout-callback`,
          },
        );
      }
    } catch (error) {
      console.log('Refresh error : ', error);
    } finally {
      await AsyncStorage.clear();
      setAuthResult(null);
      setLogoutLoading(false);
      handleLogin();
    }
  };

  // useFocusEffect to check authentication status every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setAuthLoading(true);
      checkAuthSession();
    }, []),
  );

  if (authLoading) {
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

  if (logoutLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-purple-700 via-indigo-500 to-blue-400">
        <ActivityIndicator size="large" color="#ffffff" className="mb-5" />
        <Text className="text-black text-2xl font-bold tracking-wide">
          Logging you out...
        </Text>
        <Text className="text-black text-lg font-light mt-4 text-center">
          Please wait, we are securely logging you out.
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
          </View>
        </ScrollView>
      </View>
    );
  }
};

export default MainScreen;
