import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';

const OAuthCallbackScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle the OAuth callback response here and navigate to HomeScreen
    navigation.navigate('Home');
  }, [navigation]);

  return <LoadingScreen />; // You can add a loading screen or spinner here
};

export default OAuthCallbackScreen;
