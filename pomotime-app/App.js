import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  SafeAreaView,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as StoreReview from 'expo-store-review';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

// Components
import PremiumModal from './components/PremiumModal';
import ThemeSelector from './components/ThemeSelector';
import CustomTimerModal from './components/CustomTimerModal';
import { getThemeById } from './constants/themes';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const DEFAULT_TIMES = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const [timerSettings, setTimerSettings] = useState(DEFAULT_TIMES);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalPomodoros, setTotalPomodoros] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');

  // Modal states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showCustomTimer, setShowCustomTimer] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnimationRef = useRef(null);
  const intervalRef = useRef(null);

  // 햅틱 피드백 함수
  const triggerHaptic = (type = 'light') => {
    if (Platform.OS === 'ios') {
      switch(type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } else {
      // Android
      if (type === 'heavy' || type === 'success') {
        Vibration.vibrate(100);
      } else {
        Vibration.vibrate(50);
      }
    }
  };

  // 초기 로드
  useEffect(() => {
    registerForPushNotificationsAsync();
    loadAllData();
  }, []);

  // 타이머 활성화 시 펄스 애니메이션
  useEffect(() => {
    if (isActive) {
      pulseAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimationRef.current.start();
    } else {
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
      }
      pulseAnim.setValue(1);
    }

    return () => {
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
      }
    };
  }, [isActive, pulseAnim]);

  // 원형 프로그레스 바 애니메이션
  useEffect(() => {
    const progress = timeLeft / timerSettings[mode];
    Animated.timing(circleAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [timeLeft, mode, timerSettings]);

  const registerForPushNotificationsAsync = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B6B',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          '알림 권한 필요',
          '타이머 완료 시 알림을 받으려면 알림 권한이 필요합니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.log('Push notification permission error:', error);
    }
  };

  const loadAllData = async () => {
    try {
      const [stats, premium, theme, customTimes] = await Promise.all([
        AsyncStorage.getItem('pomodoroStats'),
        AsyncStorage.getItem('isPremium'),
        AsyncStorage.getItem('currentTheme'),
        AsyncStorage.getItem('timerSettings'),
      ]);

      if (stats) {
        const { total } = JSON.parse(stats);
        setTotalPomodoros(total || 0);
      }

      if (premium) {
        setIsPremium(JSON.parse(premium));
      }

      if (theme) {
        setCurrentTheme(theme);
      }

      if (customTimes) {
        const parsed = JSON.parse(customTimes);
        setTimerSettings(parsed);
        setTimeLeft(parsed.pomodoro);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveStats = async (newTotal) => {
    try {
      await AsyncStorage.setItem('pomodoroStats', JSON.stringify({ total: newTotal }));
    } catch (error) {
      console.log('Error saving stats:', error);
    }
  };

  const savePremiumStatus = async (status) => {
    try {
      await AsyncStorage.setItem('isPremium', JSON.stringify(status));
      setIsPremium(status);
    } catch (error) {
      console.log('Error saving premium status:', error);
    }
  };

  const saveTheme = async (themeId) => {
    try {
      triggerHaptic('light');
      await AsyncStorage.setItem('currentTheme', themeId);
      setCurrentTheme(themeId);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const saveTimerSettings = async (settings) => {
    try {
      triggerHaptic('success');
      await AsyncStorage.setItem('timerSettings', JSON.stringify(settings));
      setTimerSettings(settings);
      setTimeLeft(settings[mode]);
    } catch (error) {
      console.log('Error saving timer settings:', error);
    }
  };

  const handleTimerComplete = useCallback(async () => {
    setIsActive(false);

    // 강력한 진동 패턴
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // 3번 진동
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 500);
    } else {
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: mode === 'pomodoro' ? '🎉 집중 완료!' : '☕ 휴식 완료!',
          body: mode === 'pomodoro'
            ? '훌륭합니다! 휴식 시간입니다.'
            : '다시 집중할 시간입니다!',
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.log('Notification error:', error);
    }

    if (mode === 'pomodoro') {
      const newCompleted = completedPomodoros + 1;
      setCompletedPomodoros(newCompleted);

      const newTotal = totalPomodoros + 1;
      setTotalPomodoros(newTotal);
      await saveStats(newTotal);

      // 리뷰 요청
      if (newTotal === 10 || newTotal === 50) {
        const available = await StoreReview.isAvailableAsync();
        if (available) {
          await StoreReview.requestReview();
        }
      }

      if (newCompleted % 4 === 0) {
        Alert.alert(
          '🎊 4개 완료!',
          '긴 휴식을 취하세요!',
          [{ text: '긴 휴식 시작', onPress: () => switchMode('longBreak') }]
        );
      } else {
        Alert.alert(
          '✅ 완료!',
          '잠깐 휴식하시겠어요?',
          [
            { text: '계속 집중', onPress: () => switchMode('pomodoro') },
            { text: '짧은 휴식', onPress: () => switchMode('shortBreak') }
          ]
        );
      }
    } else {
      Alert.alert(
        '⏰ 휴식 완료!',
        '다시 집중할 준비되셨나요?',
        [{ text: '시작!', onPress: () => switchMode('pomodoro') }]
      );
    }
  }, [mode, completedPomodoros, totalPomodoros]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, handleTimerComplete]);

  const switchMode = useCallback((newMode) => {
    triggerHaptic('medium');
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(timerSettings[newMode]);
  }, [timerSettings]);

  const toggleTimer = useCallback(() => {
    triggerHaptic('medium');
    setIsActive(prev => !prev);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [scaleAnim]);

  const resetTimer = useCallback(() => {
    triggerHaptic('light');
    setIsActive(false);
    setTimeLeft(timerSettings[mode]);
  }, [mode, timerSettings]);

  const resetDailyCount = useCallback(() => {
    triggerHaptic('medium');
    setCompletedPomodoros(0);
    Alert.alert('✨', '오늘의 카운트가 초기화되었습니다!');
  }, []);

  const handlePurchase = useCallback(() => {
    triggerHaptic('success');
    Alert.alert(
      '구매 완료! 🎉',
      '프리미엄 기능이 잠금 해제되었습니다!',
      [
        {
          text: '확인',
          onPress: () => {
            savePremiumStatus(true);
            setShowPremiumModal(false);
          }
        }
      ]
    );
  }, []);

  // 빠른 시작 버튼 핸들러
  const quickStart = useCallback((minutes) => {
    triggerHaptic('medium');
    setIsActive(false);
    setTimeLeft(minutes * 60);
    setMode('pomodoro');
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const theme = useMemo(() => getThemeById(currentTheme), [currentTheme]);

  const modeGradient = useMemo(() => {
    switch(mode) {
      case 'pomodoro': return theme.pomodoro;
      case 'shortBreak': return theme.shortBreak;
      case 'longBreak': return theme.longBreak;
      default: return theme.pomodoro;
    }
  }, [mode, theme]);

  const modeText = useMemo(() => {
    switch(mode) {
      case 'pomodoro': return '집중 시간';
      case 'shortBreak': return '짧은 휴식';
      case 'longBreak': return '긴 휴식';
      default: return '집중 시간';
    }
  }, [mode]);

  const modeEmoji = useMemo(() => {
    switch(mode) {
      case 'pomodoro': return '🎯';
      case 'shortBreak': return '☕';
      case 'longBreak': return '🌟';
      default: return '🎯';
    }
  }, [mode]);

  const modeTip = useMemo(() => {
    switch(mode) {
      case 'pomodoro': return '💡 25분 동안 한 가지 일에만 집중하세요';
      case 'shortBreak': return '💡 스트레칭이나 물 한 잔 어떠세요?';
      case 'longBreak': return '💡 산책하거나 간단한 운동을 해보세요';
      default: return '💡 25분 동안 한 가지 일에만 집중하세요';
    }
  }, [mode]);

  const progress = timeLeft / timerSettings[mode];
  const progressPercent = Math.round(progress * 100);
  const sessionText = mode === 'pomodoro' ? `세션 ${completedPomodoros + 1}` : '휴식 중';

  // 원형 프로그레스 바 계산
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <LinearGradient
      colors={modeGradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>

        {/* 상단 설정 버튼 */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              triggerHaptic('light');
              setShowThemeSelector(true);
            }}
            accessible={true}
            accessibilityLabel="테마 선택"
          >
            <Text style={styles.iconButtonText}>🎨</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              triggerHaptic('light');
              setShowCustomTimer(true);
            }}
            accessible={true}
            accessibilityLabel="타이머 설정"
          >
            <Text style={styles.iconButtonText}>⚙️</Text>
          </TouchableOpacity>
          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => {
                triggerHaptic('medium');
                setShowPremiumModal(true);
              }}
              accessible={true}
              accessibilityLabel="프리미엄 구매"
            >
              <Text style={styles.premiumButtonText}>👑 PRO</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 헤더 - 통계 */}
        <View style={styles.header}>
          <View
            style={styles.statCard}
            accessible={true}
            accessibilityLabel={`오늘 완료한 세션: ${completedPomodoros}개`}
          >
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>{completedPomodoros}</Text>
            <Text style={styles.statLabel}>오늘</Text>
          </View>
          <View
            style={styles.statCard}
            accessible={true}
            accessibilityLabel={`전체 완료한 세션: ${totalPomodoros}개`}
          >
            <Text style={styles.statEmoji}>✨</Text>
            <Text style={styles.statNumber}>{totalPomodoros}</Text>
            <Text style={styles.statLabel}>전체</Text>
          </View>
        </View>

        {/* 메인 타이머 */}
        <View style={styles.mainContent}>
          <Animated.View
            style={[
              styles.timerWrapper,
              { transform: [{ scale: pulseAnim }] }
            ]}
            accessible={true}
            accessibilityLabel={`${modeText} 타이머: ${formatTime(timeLeft)}`}
          >
            <View style={styles.circleContainer}>
              {/* 원형 프로그레스 바 (SVG) */}
              <Svg width="320" height="320" style={styles.progressCircle}>
                {/* 배경 원 */}
                <Circle
                  cx="160"
                  cy="160"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                {/* 프로그레스 원 */}
                <AnimatedCircle
                  cx="160"
                  cy="160"
                  r={radius}
                  stroke="#FFFFFF"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="160, 160"
                />
              </Svg>

              {/* 타이머 컨텐츠 */}
              <View style={styles.timerContent}>
                <Text style={styles.modeEmoji}>{modeEmoji}</Text>
                <Text style={styles.modeTitle}>{modeText}</Text>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
                <Text style={styles.sessionCount}>{sessionText}</Text>
              </View>
            </View>
          </Animated.View>

          {/* 빠른 시작 버튼 */}
          {!isActive && mode === 'pomodoro' && (
            <View style={styles.quickStartContainer}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => quickStart(5)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>5분</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => quickStart(10)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>10분</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => quickStart(15)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>15분</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 컨트롤 버튼 */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={resetTimer}
              onLongPress={() => {
                triggerHaptic('heavy');
                Alert.alert('타이머 리셋', '타이머를 처음으로 되돌렸습니다.');
                resetTimer();
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="타이머 리셋"
              accessibilityHint="길게 누르면 즉시 리셋"
            >
              <Text style={styles.secondaryButtonText}>↺</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={toggleTimer}
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel={isActive ? '타이머 일시정지' : '타이머 시작'}
              >
                <LinearGradient
                  colors={isActive ? ['#FF6B6B', '#FF8E53'] : ['#FFFFFF', '#F8F9FA']}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={[
                    styles.primaryButtonText,
                    isActive && styles.primaryButtonTextActive
                  ]}>
                    {isActive ? '⏸ 일시정지' : '▶ 시작하기'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={resetDailyCount}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="오늘의 카운트 초기화"
            >
              <Text style={styles.secondaryButtonText}>⟳</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 모드 선택 */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'pomodoro' && styles.modeButtonActive
            ]}
            onPress={() => switchMode('pomodoro')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="집중 모드로 전환"
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'pomodoro' && styles.modeButtonTextActive
            ]}>
              🍅 집중
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'shortBreak' && styles.modeButtonActive
            ]}
            onPress={() => switchMode('shortBreak')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="짧은 휴식 모드로 전환"
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'shortBreak' && styles.modeButtonTextActive
            ]}>
              ☕ 짧은 휴식
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'longBreak' && styles.modeButtonActive
            ]}
            onPress={() => switchMode('longBreak')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="긴 휴식 모드로 전환"
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'longBreak' && styles.modeButtonTextActive
            ]}>
              🌙 긴 휴식
            </Text>
          </TouchableOpacity>
        </View>

        {/* 하단 팁 */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>{modeTip}</Text>
        </View>
      </SafeAreaView>

      {/* Modals */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onPurchase={handlePurchase}
      />

      <ThemeSelector
        visible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
        currentTheme={currentTheme}
        onSelectTheme={saveTheme}
        isPremium={isPremium}
        onUpgrade={() => {
          setShowThemeSelector(false);
          setShowPremiumModal(true);
        }}
      />

      <CustomTimerModal
        visible={showCustomTimer}
        onClose={() => setShowCustomTimer(false)}
        onSave={saveTimerSettings}
        isPremium={isPremium}
        onUpgrade={() => {
          setShowCustomTimer(false);
          setShowPremiumModal(true);
        }}
        currentSettings={timerSettings}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 22,
  },
  premiumButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFD700',
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 20,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerWrapper: {
    marginBottom: 30,
  },
  circleContainer: {
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircle: {
    position: 'absolute',
  },
  timerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 15,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  sessionCount: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  quickStartContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  quickButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 25,
  },
  secondaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButtonText: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  primaryButtonGradient: {
    paddingVertical: 22,
    paddingHorizontal: 45,
    borderRadius: 35,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6B6B',
    letterSpacing: 0.5,
  },
  primaryButtonTextActive: {
    color: '#FFFFFF',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 6,
    gap: 6,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modeButtonText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modeButtonTextActive: {
    color: '#2D3436',
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});
