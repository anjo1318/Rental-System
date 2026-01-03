import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";


export default function DateTimePickerModalUI({ visible = true }) {


const [startTime, setStartTime] = useState(new Date());
const [endTime, setEndTime] = useState(new Date());
const [selectedDates, setSelectedDates] = useState([]);

const [showTimeModal, setShowTimeModal] = useState(false);
const [activeTimeType, setActiveTimeType] = useState("start"); const [currentMonth, setCurrentMonth] = useState(new Date());


const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min of [0, 30]) {
      const d = new Date();
      d.setHours(hour, min, 0, 0);
      slots.push(d);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();



const toggleDate = (day) => {
  setSelectedDates((prev) =>
    prev.includes(day)
      ? prev.filter(d => d !== day)
      : [...prev, day]
  );
};


const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
};

const year = currentMonth.getFullYear();
const month = currentMonth.getMonth();

const daysInMonth = getDaysInMonth(year, month);
const firstDayIndex = getFirstDayOfMonth(year, month);

const today = new Date();
today.setDate(1); // normalize to first day of month

const isAtCurrentMonth =
  currentMonth.getFullYear() === today.getFullYear() &&
  currentMonth.getMonth() === today.getMonth();


  return (
     <>
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
{/* Time Section */}
<View style={styles.timeSection}>
  <Text style={styles.timeLabel}>Time</Text>

  <View style={styles.timeRow}>
    {/* Start Time */}
    <TouchableOpacity
      style={styles.timeBoxActive}
      onPress={() => {
        setActiveTimeType("start");
        setShowTimeModal(true);
      }}
    >
      <Icon name="access-time" size={16} color="#FFF" />
      <Text style={styles.timeTextActive}>
        {startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>

    {/* End Time */}
    <TouchableOpacity
      style={styles.timeBox}
      onPress={() => {
        setActiveTimeType("end");
        setShowTimeModal(true);
      }}
    >
      <Icon name="access-time" size={16} color="#057474" />
      <Text style={styles.timeText}>
        {endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>
  </View>
</View>


          {/* Month Navigation */}
<View style={styles.monthRow}>
  {/* Previous Month */}
  <TouchableOpacity
    disabled={isAtCurrentMonth}
    onPress={() => {
      if (isAtCurrentMonth) return;

      const prev = new Date(currentMonth);
      prev.setMonth(currentMonth.getMonth() - 1);
      setCurrentMonth(prev);
      setSelectedDates([]);
    }}
  >
    <Icon
      name="chevron-left"
      size={24}
      color={isAtCurrentMonth ? "#ccc" : "#000"}
    />
  </TouchableOpacity>

  {/* Month Label */}
  <Text style={styles.monthText}>
    {currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}
  </Text>

  {/* Next Month */}
  <TouchableOpacity
    onPress={() => {
      const next = new Date(currentMonth);
      next.setMonth(currentMonth.getMonth() + 1);
      setCurrentMonth(next);
      setSelectedDates([]);
    }}
  >
    <Icon name="chevron-right" size={24} />
  </TouchableOpacity>
</View>



          {/* Week Days */}
          <View style={styles.weekRow}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <Text key={d} style={styles.weekText}>{d}</Text>
            ))}
          </View>

{/* Calendar Grid */}
<View style={styles.calendarGrid}>
  {/* Empty cells before first day */}
  {[...Array(firstDayIndex)].map((_, index) => (
    <View key={`empty-${index}`} style={styles.dayCell} />
  ))}

  {/* Actual days */}
  {[...Array(daysInMonth)].map((_, i) => {
    const day = i + 1;
    const isSelected = selectedDates.includes(day);

    return (
      <TouchableOpacity
        key={day}
        style={[
          styles.dayCell,
          isSelected && styles.daySelected
        ]}
        onPress={() => toggleDate(day)}
      >
        <Text
          style={[
            styles.dayText,
            isSelected && styles.dayTextSelected
          ]}
        >
          {day}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>



          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneBtn}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
    {/* ⏰ TIME SCROLL MODAL (ADD HERE) */}
    <Modal visible={showTimeModal} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.timeModal}>

          <Text style={styles.modalTitle}>Select Time</Text>

<ScrollView
  style={{ maxHeight: 300 }}
  contentContainerStyle={{ paddingBottom: 10 }}
  showsVerticalScrollIndicator={true}
>
  {timeSlots.map((time, index) => {
    const label = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        key={index}
        style={styles.timeOption}
        onPress={() => {
          activeTimeType === "start"
            ? setStartTime(time)
            : setEndTime(time);
          setShowTimeModal(false);
        }}
      >
        <Text style={styles.timeOptionText}>{label}</Text>
      </TouchableOpacity>
    );
  })}
</ScrollView>


        </View>
      </View>
    </Modal>
  </>
);

}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
  },

  timeSection: {
  marginBottom: 16,
},

timeLabel: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
  marginBottom: 8,
},

timeRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 12,
},

  timeBoxActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#057474",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#057474",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  timeTextActive: {
    color: "#FFF",
    fontWeight: "600",

  },
  timeText: {
    color: "#057474",
    fontWeight: "600",
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekText: {
    width: 36,
    textAlign: "center",
    color: "#777",
    fontSize: 12,
  },

calendarGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
},

  dayCell: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
    borderRadius: 18,
  },
  daySelected: {
    backgroundColor: "#057474",
  },
  dayText: {
    color: "#333",
  },
  dayTextSelected: {
    color: "#FFF",
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#057474",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  cancelText: {
    color: "#057474",
    fontWeight: "600",
  },
  doneBtn: {
    backgroundColor: "#057474",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  doneText: {
    color: "#FFF",
    fontWeight: "600",
  },

  timeModal: {
  width: "80%",
  backgroundColor: "#FFF",
  borderRadius: 16,
  padding: 16,
},

modalTitle: {
  fontSize: 16,
  fontWeight: "600",
  textAlign: "center",
  marginBottom: 12,
},

timeOption: {
  paddingVertical: 14,
  alignItems: "center",
},

timeOptionText: {
  fontSize: 18,
  color: "#057474",
},

});
