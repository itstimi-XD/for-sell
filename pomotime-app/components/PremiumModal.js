import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PremiumModal({ visible, onClose, onPurchase }) {
  const features = [
    { icon: '🎨', title: '10+ 프리미엄 테마', desc: '아름다운 그라데이션 테마' },
    { icon: '⏱️', title: '커스텀 타이머', desc: '원하는 시간으로 설정' },
    { icon: '📊', title: '상세 통계', desc: '차트와 분석 제공' },
    { icon: '🚫', title: '광고 제거', desc: '방해없이 집중' },
    { icon: '☁️', title: '클라우드 동기화', desc: '기기 간 데이터 공유 (출시 예정)' },
    { icon: '📱', title: '위젯 지원', desc: '홈 화면 위젯 (출시 예정)' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessible={true}
              accessibilityLabel="닫기"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 헤더 */}
            <View style={styles.titleContainer}>
              <Text style={styles.crown}>👑</Text>
              <Text style={styles.title}>프리미엄으로 업그레이드</Text>
              <Text style={styles.subtitle}>
                생산성을 최대로 끌어올리세요
              </Text>
            </View>

            {/* 기능 목록 */}
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Text style={styles.featureIconText}>{feature.icon}</Text>
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              ))}
            </View>

            {/* 가격 */}
            <View style={styles.pricingContainer}>
              <View style={styles.priceCard}>
                <Text style={styles.priceLabel}>평생 사용</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceOld}>₩9,900</Text>
                  <Text style={styles.priceNew}>₩4,900</Text>
                </View>
                <Text style={styles.priceBadge}>🔥 출시 기념 50% 할인</Text>
              </View>
            </View>

            {/* 구매 버튼 */}
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={onPurchase}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel="프리미엄 구매하기"
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.purchaseGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.purchaseText}>지금 업그레이드 🚀</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 복원 버튼 */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={() => {/* 구매 복원 로직 */}}
              accessible={true}
              accessibilityLabel="구매 복원"
            >
              <Text style={styles.restoreText}>구매 복원</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              구매는 한 번만 하면 평생 사용 가능합니다.{'\n'}
              30일 환불 보장
            </Text>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  crown: {
    fontSize: 64,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    fontSize: 24,
    color: '#4AFF88',
    fontWeight: '900',
  },
  pricingContainer: {
    marginBottom: 25,
  },
  priceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  priceOld: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
  },
  priceNew: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  priceBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  purchaseButton: {
    marginBottom: 15,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  purchaseGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  purchaseText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
  },
  restoreButton: {
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  restoreText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 18,
  },
});
