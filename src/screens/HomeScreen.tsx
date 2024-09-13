import React, {useEffect, useState} from 'react';
import {Button, View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logout} from 'react-native-app-auth';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [authResult, setAuthResult] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpirationDate: string | null;
    tokenType: string | null;
    scopes: string[] | null;
    idToken: string | null; // Ensure idToken is stored for OpenID Connect logout
  }>({
    accessToken: null,
    refreshToken: null,
    accessTokenExpirationDate: null,
    tokenType: null,
    scopes: null,
    idToken: null,
  });

  // Retrieve auth result from AsyncStorage when component mounts
  useEffect(() => {
    const getAuthResult = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const accessTokenExpirationDate = await AsyncStorage.getItem(
          'accessTokenExpirationDate',
        );
        const tokenType = await AsyncStorage.getItem('tokenType');
        const scopes = await AsyncStorage.getItem('scopes');
        const idToken = await AsyncStorage.getItem('idToken'); // Fetch idToken

        setAuthResult({
          accessToken,
          refreshToken,
          accessTokenExpirationDate,
          tokenType,
          scopes: JSON.parse(scopes),
          idToken,
        });
      } catch (error) {
        console.error('Error retrieving authentication result:', error);
      }
    };

    getAuthResult();
  }, []);

  const handleLogout = async () => {
    try {
      if (!authResult.idToken) {
        console.error('No idToken found for logout.');
        return;
      }

      const config = {
        issuer: `${process.env.MOBILE_APP_SERVER_URL}`,
        // issuer: 'https://66f4-112-135-30-220.ngrok-free.app',
      };

      await logout(
        {...config, clientId: 'yourClientId'},
        {
          idToken: authResult.idToken,
          // postLogoutRedirectUrl: `${process.env.MOBILE_APP_CLIENT_URL}//logout-callback`,
          postLogoutRedirectUrl: `${process.env.MOBILE_APP_CLIENT_URL}//logout-callback`,
        },
      );
      await AsyncStorage.clear();
      console.log('Logged out and authentication info removed.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

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

        {authResult && (
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
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
