import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Svg, { Path, Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { WalletService } from '../services/wallet';

const TransactionCard = ({ transaction, onPress }) => (
  <TouchableOpacity style={styles.transactionCard} onPress={onPress}>
    <Image
      source={{ uri: transaction.venues?.image_url || 'https://via.placeholder.com/50' }}
      style={styles.venueImage}
    />
    <View style={styles.transactionInfo}>
      <Text style={styles.venueName}>{transaction.venues?.name}</Text>
      <Text style={styles.transactionDate}>
        {new Date(transaction.created_at).toLocaleDateString()}
      </Text>
    </View>
    <View style={styles.transactionAmount}>
      <Text style={styles.amount}>$ {transaction.total.toFixed(2)}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </View>
  </TouchableOpacity>
);

const QRModal = ({ visible, transaction, onClose }) => {
  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Código QR</Text>
        <View style={styles.qrContainer}>
          <SvgXml xml={transaction.qr_code} width={200} height={200} />
        </View>
        <Text style={styles.modalVenueName}>{transaction.venues?.name}</Text>
        <Text style={styles.modalAmount}>$ {transaction.total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const SpendingChart = ({ data }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  const center = { x: (Dimensions.get('window').width - 32) / 2, y: 100 };
  let angle = 0;

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "L", start.x, start.y
    ].join(" ");
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Gastos por Categoría</Text>
      <View style={styles.chartContent}>
        <Svg width={Dimensions.get('window').width - 32} height={200}>
          {Object.entries(data).map(([category, amount], index) => {
            const percentage = (amount / total) * 100;
            const sliceAngle = (percentage / 100) * 360;
            const color = `hsl(${(index * 137) % 360}, 70%, 50%)`;
            
            const path = describeArc(center.x, center.y, 80, angle, angle + sliceAngle);
            const currentAngle = angle;
            angle += sliceAngle;
            
            return (
              <Path
                key={category}
                d={path}
                fill={color}
                onPress={() => Alert.alert(
                  category,
                  `$${amount.toFixed(2)} (${percentage.toFixed(1)}%)`
                )}
              />
            );
          })}
          <Circle cx={center.x} cy={center.y} r="60" fill="#fff" />
        </Svg>
        <View style={styles.legendContainer}>
          {Object.entries(data).map(([category, amount], index) => (
            <View key={category} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor,
                  { backgroundColor: `hsl(${(index * 137) % 360}, 70%, 50%)` }
                ]} 
              />
              <Text style={styles.legendText}>
                {category}: ${amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function WalletScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [spendingSummary, setSpendingSummary] = useState(0);
  const [spendingByCategory, setSpendingByCategory] = useState({});

  const loadWalletData = useCallback(async () => {
    if (!user) return;

    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const [transactionsData, summary, categories] = await Promise.all([
        WalletService.getTransactionHistory(user.id),
        WalletService.getSpendingSummary(user.id, startDate.toISOString(), endDate.toISOString()),
        WalletService.getSpendingByCategory(user.id, startDate.toISOString(), endDate.toISOString())
      ]);

      setTransactions(transactionsData);
      setSpendingSummary(summary);
      setSpendingByCategory(categories);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadWalletData();
  }, [loadWalletData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Resumen de gastos */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Gastos del Mes</Text>
        <Text style={styles.summaryAmount}>$ {spendingSummary.toFixed(2)}</Text>
      </View>

      {/* Gráfico de gastos */}
      {Object.keys(spendingByCategory).length > 0 && (
        <SpendingChart data={spendingByCategory} />
      )}

      {/* Lista de transacciones */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Historial de Transacciones</Text>
        <FlatList
          data={transactions}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onPress={() => setSelectedTransaction(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transactionsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay transacciones recientes</Text>
          }
        />
      </View>

      {/* Modal del código QR */}
      <QRModal
        visible={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: '#007AFF',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  transactionsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionsList: {
    paddingBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  modalVenueName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  chartContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: -24,
    borderRadius: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContent: {
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
}); 