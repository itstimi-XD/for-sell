import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomTimerModal({
  visible,
  onClose,
  onSave,
  isPremium,
  onUpgrade,
  currentSettings,
}) {
  const [pomodoroMinutes, setPomodoroMinutes] = useState(
    String(Math.floor(currentSettings.pomodoro / 60))
  );
  const [shortBreakMinutes, setShortBreakMinutes] = useState(
    String(Math.floor(currentSettings.shortBreak / 60))
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(
    String(Math.floor(currentSettings.longBreak / 60))
  );

  const handleSave = () => {
    const pomodoro = parseInt(pomodoroMinutes) || 25;
    const shortBreak = parseInt(shortBreakMinutes) || 5;
    const longBreak = parseInt(longBreakMinutes) || 15;

    if (pomodoro < 1 || pomodoro > 120) {
      Alert.alert('오류', '집중 시간은 1-120분 사이여야 합니다.');
      return;
    }
    if (shortBreak < 1 || shortBreak > 60) {
      Alert.alert('오류', '짧은 휴식은 1-60분 사이여야 합니다.');
      return;
    }
    if (longBreak < 1 || longBreak > 60) {
      Alert.alert('오류', '긴 휴식은 1-60분 사이여야 합니다.');
      return;
    }

    onSave({
      pomodoro: pomodoro * 60,
      shortBreak: shortBreak * 60,
      longBreak: longBreak * 60,
    });
    onClose();
  };

  const handleReset = () => {
    setPomodoroMinutes('25');
    setShortBreakMinutes('5');
    setLongBreakMinutes('15');
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
            <Text style={styles.title}>타이머 설정</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessible={true}
              accessibilityLabel="닫기"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {!isPremium ? (
            // 프리미엄 프로모션
            <View style={styles.premiumPromo}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.promoTitle}>프리미엄 기능</Text>
              <Text style={styles.promoSubtitle}>
                커스텀 타이머는 프리미엄 사용자만{'\n'}
                사용할 수 있습니다
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => {
                  onClose();
                  onUpgrade();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.upgradeGradient}
                >
                  <Text style={styles.upgradeText}>프리미엄 구매하기 👑</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            // 커스텀 타이머 설정
            <View style={styles.content}>
              <View style={styles.settingGroup}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingIcon}>🎯</Text>
                  <Text style={styles.settingLabel}>집중 시간</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={pomodoroMinutes}
                    onChangeText={setPomodoroMinutes}
                    keyboardType="number-pad"
                    maxLength={3}
                    accessible={true}
                    accessibilityLabel="집중 시간 입력"
                  />
                  <Text style={styles.inputUnit}>분</Text>
                </View>
                <Text style={styles.hint}>권장: 25분</Text>
              </View>

              <View style={styles.settingGroup}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingIcon}>☕</Text>
                  <Text style={styles.settingLabel}>짧은 휴식</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={shortBreakMinutes}
                    onChangeText={setShortBreakMinutes}
                    keyboardType="number-pad"
                    maxLength={2}
                    accessible={true}
                    accessibilityLabel="짧은 휴식 시간 입력"
                  />
                  <Text style={styles.inputUnit}>분</Text>
                </View>
                <Text style={styles.hint}>권장: 5분</Text>
              </View>

              <View style={styles.settingGroup}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingIcon}>🌟</Text>
                  <Text style={styles.settingLabel}>긴 휴식</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={longBreakMinutes}
                    onChangeText={setLongBreakMinutes}
                    keyboardType="number-pad"
                    maxLength={2}
                    accessible={true}
                    accessibilityLabel="긴 휴식 시간 입력"
                  />
                  <Text style={styles.inputUnit}>분</Text>
                </View>
                <Text style={styles.hint}>권장: 15분</Text>
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetButtonText}>기본값으로 초기화</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4ECDC4', '#44A08D']}
                    style={styles.saveGradient}
                  >
                    <Text style={styles.saveButtonText}>저장</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    maxHeight: '80%',
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
  content: {
    padding: 20,
  },
  settingGroup: {
    marginBottom: 30,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '900',
    color: '#2D3436',
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginLeft: 10,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginLeft: 5,
  },
  buttons: {
    gap: 12,
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  saveButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  premiumPromo: {
    padding: 40,
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2D3436',
    marginBottom: 10,
  },
  promoSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  upgradeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
});
