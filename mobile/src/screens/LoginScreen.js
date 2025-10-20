import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/constants';
import theme from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    const trimmed = username.trim();
    
    if (!trimmed) {
      return;
    }

    if (trimmed.length < 2) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: trimmed }),
      });

      const data = await response.json();

      if (response.ok) {
        await login(data.userId, data.username);
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Title */}
          <Text style={styles.title}>Who are you?</Text>

          {/* Input */}
          <TextInput
            style={styles.input}
            placeholder="Nickname"
            placeholderTextColor={theme.colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            maxLength={20}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* Skewed Button */}
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleLogin}
            disabled={loading || !username.trim()}
            activeOpacity={0.9}
          >
            <View style={[
              styles.button, 
              (!username.trim() || loading) && styles.buttonDisabled
            ]}>
              <Text style={styles.buttonText}>
                {loading ? 'Connecting...' : 'Continue'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Shown to your opponent.</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    marginBottom: 60,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 18,
    fontSize: theme.typography.base,
    color: theme.colors.textPrimary,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '85%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.colors.cyan,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '-8deg' }],
    ...theme.shadows.cyan,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.cardLight,
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: theme.typography.bold,
    transform: [{ skewX: '8deg' }],
  },
  subtitle: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
});
