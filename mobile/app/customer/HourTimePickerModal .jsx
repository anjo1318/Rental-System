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

  // ✅ Scroll to initial position when component mounts or selectedIndex changes
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

// Time Picker Modal for Hour rental
export function HourTimePickerModal({ visible, onCancel, onDone, initialDate }) {
  // Generate hours (1-12) and minutes (00-59)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const periods = ['AM', 'PM'];

  // ✅ Recalculate indices whenever initialDate or visible changes
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

  // ✅ Update indices when modal becomes visible or initialDate changes
  useEffect(() => {
    if (visible) {
      const newIndices = getInitialIndices();
      setIndices(newIndices);
    }
  }, [visible, initialDate]);

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

    const selectedDate = new Date(initialDate || new Date());
    selectedDate.setHours(hour24, minute, 0, 0);

    onDone && onDone(selectedDate);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Select Time</Text>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

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
    backgroundColor: '#1C1C1E',
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
    borderBottomColor: '#38383A',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  cancelText: {
    fontSize: 17,
    color: '#0A84FF',
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0A84FF',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * 5,
    paddingHorizontal: 20,
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
    color: '#FFF',
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
    color: '#8E8E93',
    fontWeight: '400',
  },
  selectedItemText: {
    color: '#FFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#38383A',
  },
});