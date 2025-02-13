import supabase from '../lib/supabase';
import QRCode from 'qrcode';
import { SecurityService } from './security';

export const WalletService = {
  // Obtener historial de transacciones del usuario
  getTransactionHistory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          venues (
            name,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  },

  // Crear una nueva transacción con verificación biométrica
  createTransaction: async (userId, venueId, total, items) => {
    try {
      // Obtener configuración de seguridad
      const securitySettings = await SecurityService.getSecuritySettings(userId);

      // Verificar si se requiere autenticación biométrica
      if (securitySettings?.requireBiometrics) {
        const isAuthenticated = await SecurityService.authenticateWithBiometrics();
        if (!isAuthenticated) {
          throw new Error('Autenticación biométrica fallida');
        }
      }

      // Generar código QR único
      const qrData = {
        transactionId: crypto.randomUUID(),
        userId,
        venueId,
        timestamp: new Date().toISOString(),
        total,
        items
      };

      const qrCode = await QRCode.toString(JSON.stringify(qrData), {
        type: 'svg',
        errorCorrectionLevel: 'H'
      });

      // Crear la transacción en la base de datos
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          venue_id: venueId,
          total,
          qr_code: qrCode,
          items: items
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error; // Propagar el error para manejarlo en la UI
    }
  },

  // Verificar estado de una transacción
  verifyTransaction: async (transactionId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          venues (
            name,
            image_url
          )
        `)
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return null;
    }
  },

  // Obtener el total gastado en un período
  getSpendingSummary: async (userId, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('total, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      return data.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
    } catch (error) {
      console.error('Error getting spending summary:', error);
      return 0;
    }
  },

  // Obtener estadísticas de gastos por categoría
  getSpendingByCategory: async (userId, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          total,
          items,
          venues (
            category
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      // Agrupar por categoría
      return data.reduce((acc, curr) => {
        const category = curr.venues?.category || 'Otros';
        acc[category] = (acc[category] || 0) + parseFloat(curr.total);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting spending by category:', error);
      return {};
    }
  }
}; 