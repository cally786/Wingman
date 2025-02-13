import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export const SecurityService = {
  // Verificar si el dispositivo soporta biometría
  checkBiometricSupport: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      return {
        supported: hasHardware && isEnrolled,
        type: await LocalAuthentication.supportedAuthenticationTypesAsync()
      };
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return { supported: false, type: [] };
    }
  },

  // Autenticar usando biometría
  authenticateWithBiometrics: async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación requerida para continuar',
        fallbackLabel: 'Usar PIN',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Error in biometric authentication:', error);
      return false;
    }
  },

  // Guardar configuración de seguridad
  saveSecuritySettings: async (userId, settings) => {
    try {
      await SecureStore.setItemAsync(
        `security_settings_${userId}`,
        JSON.stringify(settings)
      );
      return true;
    } catch (error) {
      console.error('Error saving security settings:', error);
      return false;
    }
  },

  // Obtener configuración de seguridad
  getSecuritySettings: async (userId) => {
    try {
      const settings = await SecureStore.getItemAsync(`security_settings_${userId}`);
      return settings ? JSON.parse(settings) : {
        requireBiometrics: false,
        requirePinForPurchases: false,
      };
    } catch (error) {
      console.error('Error getting security settings:', error);
      return null;
    }
  },

  // Verificar PIN
  verifyPIN: async (userId, pin) => {
    try {
      const storedPin = await SecureStore.getItemAsync(`user_pin_${userId}`);
      return storedPin === pin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  },

  // Establecer PIN
  setPIN: async (userId, pin) => {
    try {
      await SecureStore.setItemAsync(`user_pin_${userId}`, pin);
      return true;
    } catch (error) {
      console.error('Error setting PIN:', error);
      return false;
    }
  }
}; 