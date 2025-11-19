import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const POMODORO_TIME = 25 * 60; // 25분
  const SHORT_BREAK = 5 * 60; // 5분
  const LONG_BREAK = 15 * 60; // 15분

  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalPomodoros, setTotalPomodoros] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  // 알림 권한 요청
  useEffect(() => {
    registerForPushNotificationsAsync();
    loadStats();
  }, []);

  // 타이머 활성화 시 펄스 애니메이션
  useEffect(() => {
    if (isActive) {
      Animated.loop(
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
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const registerForPushNotificationsAsync = async () => {
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
  };

  const loadStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('pomodoroStats');
      if (stats) {
        const { total } = JSON.parse(stats);
        setTotalPomodoros(total || 0);
      }
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const saveStats = async (newTotal) => {
    try {
      await AsyncStorage.setItem('pomodoroStats', JSON.stringify({ total: newTotal }));
    } catch (error) {
      console.log('Error saving stats:', error);
    }
  };

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
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);

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

    if (mode === 'pomodoro') {
      const newCompleted = completedPomodoros + 1;
      setCompletedPomodoros(newCompleted);

      const newTotal = totalPomodoros + 1;
      setTotalPomodoros(newTotal);
      await saveStats(newTotal);

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
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);

    const times = {
      pomodoro: POMODORO_TIME,
      shortBreak: SHORT_BREAK,
      longBreak: LONG_BREAK
    };

    setTimeLeft(times[newMode]);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);

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
  };

  const resetTimer = () => {
    setIsActive(false);
    const times = {
      pomodoro: POMODORO_TIME,
      shortBreak: SHORT_BREAK,
      longBreak: LONG_BREAK
    };
    setTimeLeft(times[mode]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeGradient = () => {
    switch(mode) {
      case 'pomodoro': return ['#FF6B6B', '#FF8E53', '#FFB347'];
      case 'shortBreak': return ['#4ECDC4', '#44A08D', '#5BCFC5'];
      case 'longBreak': return ['#667EEA', '#764BA2', '#8E73E8'];
      default: return ['#FF6B6B', '#FF8E53', '#FFB347'];
    }
  };

  const getModeText = () => {
    switch(mode) {
      case 'pomodoro': return '집중 시간';
      case 'shortBreak': return '짧은 휴식';
      case 'longBreak': return '긴 휴식';
      default: return '집중 시간';
    }
  };

  const getModeEmoji = () => {
    switch(mode) {
      case 'pomodoro': return '🎯';
      case 'shortBreak': return '☕';
      case 'longBreak': return '🌟';
      default: return '🎯';
    }
  };

  const progress = timeLeft / (mode === 'pomodoro' ? POMODORO_TIME : mode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK);
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <LinearGradient
      colors={getModeGradient()}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>

        {/* 헤더 - 통계 */}
        <View style={styles.header}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>{completedPomodoros}</Text>
            <Text style={styles.statLabel}>오늘</Text>
          </View>
          <View style={styles.statCard}>
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
          >
            {/* 원형 프로그레스 배경 */}
            <View style={styles.circleContainer}>
              {/* 외부 링 */}
              <View style={styles.outerRing} />

              {/* 타이머 컨텐츠 */}
              <View style={styles.timerContent}>
                <Text style={styles.modeEmoji}>{getModeEmoji()}</Text>
                <Text style={styles.modeTitle}>{getModeText()}</Text>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

                {/* 프로그레스 바 */}
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBar,
                    { width: `${progress * 100}%` }
                  ]} />
                </View>

                <Text style={styles.sessionCount}>
                  {mode === 'pomodoro' ? `세션 ${completedPomodoros + 1}` : '휴식 중'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* 컨트롤 버튼 */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={resetTimer}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>↺</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={toggleTimer}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    {isActive ? '일시정지' : '시작하기'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setCompletedPomodoros(0);
                Alert.alert('✨', '오늘의 카운트가 초기화되었습니다!');
              }}
              activeOpacity={0.7}
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
          <Text style={styles.tipText}>
            {mode === 'pomodoro'
              ? '💡 25분 동안 한 가지 일에만 집중하세요'
              : mode === 'shortBreak'
              ? '💡 스트레칭이나 물 한 잔 어떠세요?'
              : '💡 산책하거나 간단한 운동을 해보세요'
            }
          </Text>
        </View>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 20,
    minWidth: 110,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
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
    marginBottom: 50,
  },
  circleContainer: {
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  timerContent: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  modeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 15,
    letterSpacing: 1,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#2D3436',
    marginBottom: 20,
    letterSpacing: -2,
  },
  progressBarContainer: {
    width: '65%',
    height: 8,
    backgroundColor: '#E8EAF0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
  },
  sessionCount: {
    fontSize: 15,
    color: '#999',
    fontWeight: '600',
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
    paddingHorizontal: 50,
    borderRadius: 35,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF6B6B',
    letterSpacing: 0.5,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 6,
    gap: 6,
    marginBottom: 25,
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
