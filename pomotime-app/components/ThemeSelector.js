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
import { THEMES, FREE_THEMES, PREMIUM_THEMES } from '../constants/themes';

export default function ThemeSelector({
  visible,
  onClose,
  currentTheme,
  onSelectTheme,
  isPremium,
  onUpgrade,
}) {
  const renderThemeCard = (theme) => {
    const isLocked = theme.premium && !isPremium;
    const isActive = currentTheme === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        style={[styles.themeCard, isActive && styles.themeCardActive]}
        onPress={() => {
          if (isLocked) {
            onUpgrade();
          } else {
            onSelectTheme(theme.id);
          }
        }}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={`${theme.name} 테마${isLocked ? ' (프리미엄)' : ''}${isActive ? ' (선택됨)' : ''}`}
      >
        <LinearGradient
          colors={theme.pomodoro}
          style={styles.themePreview}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
          {isActive && (
            <View style={styles.checkOverlay}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          )}
        </LinearGradient>
        <Text style={styles.themeName}>{theme.name}</Text>
        {theme.premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>테마 선택</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessible={true}
              accessibilityLabel="닫기"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* 무료 테마 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>무료 테마</Text>
              <View style={styles.themeGrid}>
                {FREE_THEMES.map(renderThemeCard)}
              </View>
            </View>

            {/* 프리미엄 테마 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>프리미엄 테마</Text>
                {!isPremium && (
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={onUpgrade}
                  >
                    <Text style={styles.upgradeButtonText}>업그레이드 👑</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.themeGrid}>
                {PREMIUM_THEMES.map(renderThemeCard)}
              </View>
            </View>

            {!isPremium && (
              <View style={styles.premiumPromo}>
                <Text style={styles.promoTitle}>🎨 모든 테마 잠금 해제</Text>
                <Text style={styles.promoSubtitle}>
                  10가지 아름다운 프리미엄 테마로{'\n'}
                  나만의 스타일을 만들어보세요
                </Text>
                <TouchableOpacity
                  style={styles.promoButton}
                  onPress={onUpgrade}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.promoButtonGradient}
                  >
                    <Text style={styles.promoButtonText}>프리미엄 구매하기</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2D3436',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 15,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  themeCard: {
    width: '30%',
    marginBottom: 10,
  },
  themeCardActive: {
    transform: [{ scale: 1.05 }],
  },
  themePreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 32,
  },
  checkOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4AFF88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  themeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#333',
  },
  premiumPromo: {
    margin: 20,
    padding: 25,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D3436',
    marginBottom: 10,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  promoButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  promoButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  promoButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
  },
});
