import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 44;

// iOS-style wheel picker component
export function WheelPicker({ items, selectedIndex, onSelect, unit = '' }) {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex !== undefined) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [selectedIndex]);

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);
    setCurrentIndex(index);
  };

  const handleMomentumScrollEnd = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);
    onSelect(index);
  };

  return (
    <View style={pickerStyles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item, index) => {
          const isSelected = index === currentIndex;
          return (
            <TouchableOpacity
              key={index}
              style={pickerStyles.item}
              onPress={() => {
                scrollViewRef.current?.scrollTo({
                  y: index * ITEM_HEIGHT,
                  animated: true,
                });
                onSelect(index);
              }}
            >
              <Text
                style={[
                  pickerStyles.itemText,
                  isSelected && pickerStyles.selectedItemText,
                ]}
              >
                {item}{unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Selection indicator */}
      <View style={pickerStyles.selectionIndicator} pointerEvents="none">
        <View style={pickerStyles.selectionBar} />
      </View>
    </View>
  );
}

// Combined Date & Time Picker Modal
export function HourTimePickerModal({ visible, onCancel, onDone, initialDate }) {
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

  // Time picker data
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const getInitialIndices = () => {
    const initial = initialDate || new Date();
    const initialHour = initial.getHours();
    const initialMinute = initial.getMinutes();

    return {
      hour: initialHour === 0 ? 11 : initialHour > 12 ? initialHour - 13 : initialHour - 1,
      minute: initialMinute,
      period: initialHour >= 12 ? 1 : 0,
    };
  };

  const [indices, setIndices] = useState(getInitialIndices());

  useEffect(() => {
    if (visible) {
      setShowDatePicker(true);
      setCurrentMonth(initialDate || new Date());
      setSelectedDate(initialDate || new Date());
      const newIndices = getInitialIndices();
      setIndices(newIndices);
    }
  }, [visible, initialDate]);

  // Calendar functions
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const today = new Date();
  const isAtCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  const isPastDate = (day) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayMidnight;
  };

  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Preserve the current time
    newDate.setHours(selectedDate.getHours());
    newDate.setMinutes(selectedDate.getMinutes());
    setSelectedDate(newDate);
  };

  const handleDone = () => {
    const hour = hours[indices.hour];
    const minute = parseInt(minutes[indices.minute]);
    const period = periods[indices.period];

    // Convert to 24-hour format
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) {
      hour24 = hour + 12;
    } else if (period === 'AM' && hour === 12) {
      hour24 = 0;
    }

    const finalDate = new Date(selectedDate);
    finalDate.setHours(hour24, minute, 0, 0);

    onDone && onDone(finalDate);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {showDatePicker ? 'Select Date' : 'Select Time'}
            </Text>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, showDatePicker && styles.activeTab]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="date-range" size={20} color={showDatePicker ? '#FFFFFF' : '#666'} />
              <Text style={[styles.tabText, showDatePicker && styles.activeTabText]}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !showDatePicker && styles.activeTab]}
              onPress={() => setShowDatePicker(false)}
            >
              <Icon name="access-time" size={20} color={!showDatePicker ? '#FFFFFF' : '#666'} />
              <Text style={[styles.tabText, !showDatePicker && styles.activeTabText]}>Time</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker ? (
            /* Calendar View */
            <View style={styles.calendarContainer}>
              {/* Month Navigation */}
              <View style={styles.monthRow}>
                <TouchableOpacity
                  disabled={isAtCurrentMonth}
                  onPress={() => {
                    if (isAtCurrentMonth) return;
                    const prev = new Date(currentMonth);
                    prev.setMonth(currentMonth.getMonth() - 1);
                    setCurrentMonth(prev);
                  }}
                >
                  <Icon
                    name="chevron-left"
                    size={24}
                    color={isAtCurrentMonth ? '#CCCCCC' : '#000'}
                  />
                </TouchableOpacity>

                <Text style={styles.monthText}>
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    const next = new Date(currentMonth);
                    next.setMonth(currentMonth.getMonth() + 1);
                    setCurrentMonth(next);
                  }}
                >
                  <Icon name="chevron-right" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Week Days */}
              <View style={styles.weekRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <Text key={d} style={styles.weekText}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {[...Array(firstDayIndex)].map((_, index) => (
                  <View key={`empty-${index}`} style={styles.dayCell} />
                ))}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth.getMonth() &&
                    selectedDate.getFullYear() === currentMonth.getFullYear();
                  const isDisabled = isPastDate(day);

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCell,
                        isSelected && styles.daySelected,
                        isDisabled && styles.dayDisabled,
                      ]}
                      onPress={() => !isDisabled && selectDate(day)}
                      disabled={isDisabled}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          isDisabled && styles.dayTextDisabled,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            /* Time Picker View */
            <View style={styles.pickerRow}>
              <WheelPicker
                items={hours}
                selectedIndex={indices.hour}
                onSelect={(index) => setIndices({ ...indices, hour: index })}
              />
              <View style={styles.separator}>
                <Text style={styles.separatorText}>:</Text>
              </View>
              <WheelPicker
                items={minutes}
                selectedIndex={indices.minute}
                onSelect={(index) => setIndices({ ...indices, minute: index })}
              />
              <WheelPicker
                items={periods}
                selectedIndex={indices.period}
                onSelect={(index) => setIndices({ ...indices, period: index })}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  cancelText: {
    fontSize: 17,
    color: '#057474',
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#057474',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#057474',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekText: {
    width: 36,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 18,
  },
  daySelected: {
    backgroundColor: '#057474',
  },
  dayText: {
    color: '#333',
    fontSize: 15,
  },
  dayTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  dayDisabled: {
    opacity: 0.3,
  },
  dayTextDisabled: {
    color: '#CCCCCC',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * 5,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  separator: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  separatorText: {
    fontSize: 34,
    fontWeight: '300',
    color: '#000',
  },
});

const pickerStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    width: 80,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 23,
    color: '#999',
    fontWeight: '400',
  },
  selectedItemText: {
    color: '#000',
    fontWeight: '400',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  selectionBar: {
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(5, 116, 116, 0.1)',  // Changed to match your theme color with transparency
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#E0E0E0',
  },
});