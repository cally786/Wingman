import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Svg, { Path, Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { WalletService } from '../../services/wallet';

// ... resto del código existente ... 