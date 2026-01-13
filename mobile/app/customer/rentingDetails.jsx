import React, { useState, useEffect, useCallback } from "react";
import {Modal,View,Text,StyleSheet,Dimensions,TouchableOpacity,StatusBar,Alert,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  BackHandler,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FolderPen } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import RentingPaymentMethod from "./rentingPaymentMethod";
import ConfirmationScreen from "./confirmationScreen";
import Header from "../components/header3";
import ScreenWrapper from "../components/screenwrapper";

const { width, height } = Dimensions.get("window");



export function DateTimePickerModalUI({ visible = true, onCancel, onDone, initialDate, mode = "date" }) {
  const [selectedTime, setSelectedTime] = useState(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());

  // Generate time slots every 30 minutes
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {  // ✅ Changed: 6 AM to 10 PM (22:00)
      for (let min of [0]) {
        const d = new Date();
        d.setHours(hour, min, 0, 0);
        slots.push(d);
      }
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  // Select a specific date
  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Copy time from selectedTime to preserve it
    newDate.setHours(selectedTime.getHours());
    newDate.setMinutes(selectedTime.getMinutes());
    setSelectedDate(newDate);
  };

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

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Time Section */}
            
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Time</Text>
              <TouchableOpacity
                style={styles.timeBoxActive}
                onPress={() => setShowTimeModal(true)}
              >
                <Icon name="access-time" size={16} color="#FFF" />
                <Text style={styles.timeTextActive}>
                  {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

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
                  color={isAtCurrentMonth ? "#ccc" : "#000"}
                />
              </TouchableOpacity>

              <Text style={styles.monthText}>
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const next = new Date(currentMonth);
                  next.setMonth(currentMonth.getMonth() + 1);
                  setCurrentMonth(next);
                }}
              >
                <Icon name="chevron-right" size={24} />
              </TouchableOpacity>
            </View>

            {/* Week Days */}
            <View style={styles.weekRow}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
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
                      isDisabled && styles.dayDisabled
                    ]}
                    onPress={() => !isDisabled && selectDate(day)}
                    disabled={isDisabled}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        isDisabled && styles.dayTextDisabled
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
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => onCancel && onCancel()}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                const finalDateTime = new Date(selectedDate);
                finalDateTime.setHours(selectedTime.getHours());
                finalDateTime.setMinutes(selectedTime.getMinutes());
                onDone && onDone(finalDateTime);
              }}
            >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Scroll Modal */}
      <Modal visible={showTimeModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.timeModal}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <ScrollView
              style={{ maxHeight: 300 }}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator
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
                    setSelectedTime(time);
                    const updatedDate = new Date(selectedDate);
                    updatedDate.setHours(time.getHours());
                    updatedDate.setMinutes(time.getMinutes());
                    setSelectedDate(updatedDate);
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

// Add your full styles here (paste the previous styles from your modal code)


export default function RentingDetails() {
  const router = useRouter();
  const { id, itemId } = useLocalSearchParams();
  
  // Step progress
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState(null);
  const steps = ["Booking Details", "Payment Details", "Confirmed"];
  const [userId, setUserId] = useState("");

  
  // Form states
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");

  
  // Gender selection
  const [gender, setGender] = useState("");
  const genderOptions = ["Male", "Female", "Other"];
  
  // Rental period
  const [rentalPeriod, setRentalPeriod] = useState("Day");
  const rentalOptions = ["Hour", "Day", "Week"];

  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [showReturnTimePicker, setShowReturnTimePicker] = useState(false);

  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [activeDateType, setActiveDateType] = useState("pickup");

  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());

  
  // Item data
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  //Guarantors Data
  const [guarantor1FullName, setGuarantor1FullName] = useState("");
  const [guarantor1PhoneNumber, setGuarantor1PhoneNumber] = useState("");
  const [guarantor1Address, setGuarantor1Address] = useState("");
  const [guarantor1Email, setGuarantor1Email] = useState("");
  const [guarantor2FullName, setGuarantor2FullName] = useState("");
  const [guarantor2PhoneNumber, setGuarantor2PhoneNumber] = useState("");
  const [guarantor2Address, setGuarantor2Address] = useState("");
  const [guarantor2Email, setGuarantor2Email] = useState("");
  const [errors, setErrors] = useState({});

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    console.log("RentingDetails loaded with params:", { id, itemId });
    loadUserData();
    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId]);

  useEffect(() => {
    if (item) {
        console.log("Item state updated:", item);
    }
    }, [item]);

    useEffect(() => {
      const onBackPress = () => {
        if (currentStep === 2) {
          setCurrentStep(1);
          return true; // Prevent default back behavior
        } else if (currentStep === 3) {
          setCurrentStep(2);
          return true;
        }
        return false; // Allow default back behavior
      };
    
      // Handle Android hardware back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
      return () => backHandler.remove();
    }, [currentStep]);


  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("From local storgae", userData);
        setUserId(user.id || "");
        setFullName(`${user.firstName}  ${user.lastName}` || "");
        setEmailAddress(user.email || "");
        setPhoneNumber(user.phone|| "");
        setLocation(`${user.street}, ${user.barangay}, ${user.town}, ${user.province}` || "");
        setGender(user.gender);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchItemDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/item/${itemId}`);
      if (response.data.success) {
        console.log("This is the api/item", response.data.data);
        setItem(response.data.data);
        console.log("data of Item", item);

      }
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  };

  const calculateRentalDuration = () => {
    const diffMs = returnDate - pickupDate;
    
    if (rentalPeriod === "Hour") {
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return diffHours;
    } else if (rentalPeriod === "Day") {
      // ✅ Check if same day rental
      const pickupDay = new Date(pickupDate.getFullYear(), pickupDate.getMonth(), pickupDate.getDate());
      const returnDay = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());
      
      if (pickupDay.getTime() === returnDay.getTime()) {
        // Same day - calculate hours
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        return diffHours;
      } else {
        // Different days - calculate days
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays;
      }
    } else if (rentalPeriod === "Week") {
      const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
      return diffWeeks;
    }
    return 1;
  };

  const validateForm = () => {
    const newErrors = {};
  
    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    }
    if (!emailAddress.trim()) {
      newErrors.emailAddress = "Please enter your email address";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Please enter your contact number";
    } else if (!/^09\d{9}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number must be 11 digits and start with 09";
    }
    if (!location.trim()) {
      newErrors.location = "Please enter your location";
    }
    if (!gender) {
      newErrors.gender = "Please select your gender";
    }
  
    // Guarantor 1 validation
    if (!guarantor1FullName.trim()) {
      newErrors.guarantor1FullName = "Please enter Guarantor 1 full name";
    }
    if (!guarantor1PhoneNumber.trim()) {
      newErrors.guarantor1PhoneNumber = "Please enter Guarantor 1 phone number";
    } else if (!/^09\d{9}$/.test(guarantor1PhoneNumber.trim())) {
      newErrors.guarantor1PhoneNumber = "Phone number must be 11 digits and start with 09";
    }
    if (!guarantor1Address.trim()) {
      newErrors.guarantor1Address = "Please enter Guarantor 1 address";
    }
    if (!guarantor1Email.trim()) {
      newErrors.guarantor1Email = "Please enter Guarantor 1 email address";
    } else if (!/^[^\s@]+@gmail\.com$/.test(guarantor1Email.trim().toLowerCase())) {
      newErrors.guarantor1Email = "Email must be a valid Gmail address";
    }
  
    // Guarantor 2 validation
    if (!guarantor2FullName.trim()) {
      newErrors.guarantor2FullName = "Please enter Guarantor 2 full name";
    }
    if (!guarantor2PhoneNumber.trim()) {
      newErrors.guarantor2PhoneNumber = "Please enter Guarantor 2 phone number";
    } else if (!/^09\d{9}$/.test(guarantor2PhoneNumber.trim())) {
      newErrors.guarantor2PhoneNumber = "Phone number must be 11 digits and start with 09";
    }
    if (!guarantor2Address.trim()) {
      newErrors.guarantor2Address = "Please enter Guarantor 2 address";
    }
    if (!guarantor2Email.trim()) {
      newErrors.guarantor2Email = "Please enter Guarantor 2 email address";
    } else if (!/^[^\s@]+@gmail\.com$/.test(guarantor2Email.trim().toLowerCase())) {
      newErrors.guarantor2Email = "Email must be a valid Gmail address";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!validateForm()) return;

    if (!item) {
      Alert.alert("Error", "Item details not loaded yet.");
      return;
    }

    // ✅ Extract image from itemImages array
    const imageUrl = item.itemImages && item.itemImages.length > 0 
      ? item.itemImages[0] 
      : null;

    if (!imageUrl) {
      console.error("WARNING: No image found in item object");
      Alert.alert("Error", "Item image is missing. Please try again.");
      return;
    }

    // ✅ Calculate duration
    const duration = calculateRentalDuration();

    const data = {
      itemId: parseInt(itemId),
      ownerId: item.Owner.id,
      itemDetails: {
        ownerId: item.Owner.id,
        title: item.title ?? "Unknown Product",
        category: item.category,
        location: item.location,
        itemImage: imageUrl,
        pricePerDay: item.pricePerDay,
      },
      customerDetails: {
        customerId: userId,
        fullName,
        email: emailAddress,
        phone: phoneNumber,
        location,
        gender,
      },
      rentalDetails: {
        period: rentalPeriod, // "Hour", "Day", or "Week"
        pickupDate,
        returnDate,
        duration, // ✅ calculated duration
      },
      guarantors: [
        {
          fullName: guarantor1FullName,
          phoneNumber: guarantor1PhoneNumber,
          address: guarantor1Address,
          email: guarantor1Email,
        },
        {
          fullName: guarantor2FullName,
          phoneNumber: guarantor2PhoneNumber,
          address: guarantor2Address,
          email: guarantor2Email,
        },
      ],
    };

    setBookingData(data);
    console.log("Booking Data Prepared:", data);
    console.log("Using image:", imageUrl);
    setCurrentStep(2);
  };

const proceedWithBooking = (imageUrl) => {
  const duration = calculateRentalDuration();
  
  const data = {
    itemId: parseInt(itemId),
    ownerId: item.Owner.id,
    itemDetails: {
      ownerId: item.Owner.id,
      title: item.title ?? "Unknown Product",
      category: item.category,
      location: item.location,
      itemImage: imageUrl,
      pricePerDay: item.pricePerDay,
    },
    customerDetails: {
      customerId: userId,
      fullName,
      email: emailAddress,
      phone: phoneNumber,
      location,
      gender,
    },
    rentalDetails: {
      period: rentalPeriod,
      pickupDate,
      returnDate,
      duration,
    },
    guarantors: [
      {
        fullName: guarantor1FullName,
        phoneNumber: guarantor1PhoneNumber,
        address: guarantor1Address,
        email: guarantor1Email,
      },
      {
        fullName: guarantor2FullName,
        phoneNumber: guarantor2PhoneNumber,
        address: guarantor2Address,
        email: guarantor2Email,
      },
    ],
  };

  console.log("Booking Data Prepared:", data);
  console.log("Image URL:", imageUrl);
  setBookingData(data);
  setCurrentStep(2);
};

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderProgressStep = (stepNumber, stepName, isActive, isCompleted) => (
    <View style={styles.stepContainer} key={stepNumber}>
      <View style={[
        styles.stepCircle,
        isActive && styles.activeStepCircle,
        isCompleted && styles.completedStepCircle
      ]}>
        {isCompleted ? (
          <Icon name="check" size={16} color="#FFF" />
        ) : (
          <Text style={[
            styles.stepNumber,
            isActive && styles.activeStepNumber
          ]}>
            {stepNumber}
          </Text>
        )}
      </View>
      <Text style={[
        styles.stepName,
        isActive && styles.activeStepName
      ]}>
        {stepName}
      </Text>
    </View>
  );

  const renderGenderOption = (option) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.optionButton,
        gender === option && styles.selectedOptionButton
      ]}
      onPress={() => setGender(option)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.optionText,
        gender === option && styles.selectedOptionText
      ]}>
        {option}
      </Text>
    </TouchableOpacity>
  );

  const renderRentalPeriodOption = (option) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.optionButton,
        rentalPeriod === option && styles.selectedOptionButton
      ]}
      onPress={() => setRentalPeriod(option)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.optionText,
        rentalPeriod === option && styles.selectedOptionText
      ]}>
        {option}
      </Text>
    </TouchableOpacity>
  );

    return (
   <ScreenWrapper>
        <Header
          title="Renting Details"
          backgroundColor="#fff"
        />

        {currentStep === 2 ? (
        // ✅ Payment screen takes full screen
        <RentingPaymentMethod
        bookingData={bookingData}
        onBack={() => setCurrentStep(1)}
        onContinue={(updatedBooking) => {
            setBookingData(updatedBooking); // ✅ update state
            setCurrentStep(3); // go to confirmation screen
        }}
        />

        ) : currentStep === 3 ? (
          // ✅ Confirmation screen takes full screen
          <ConfirmationScreen 
            bookingData={bookingData}
            onBack={() => setCurrentStep(2)} // ✅ Add this line
            onContinue={() => console.log("Done!")} 
          />
        ) : (
        // ✅ Step 1 → Renting Details (form + progress bar)
        <>
           
            

            {/* Renting form (Step 1 content) */}
            <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
              {/* Progress Steps */}
            <View style={styles.progressContainer}>
            <View style={styles.progressSteps}>
                {steps.map((stepName, index) => (
                <React.Fragment key={index}>
                    {renderProgressStep(
                    index + 1,
                    stepName,
                    currentStep === index + 1,
                    currentStep > index + 1
                    )}
                    {index < steps.length - 1 && (     
                    <View style={styles.lineWrapper}>
                    <View 
                        style={[
                        styles.progressLine,
                        currentStep > index + 1 && styles.completedProgressLine,
                        ]}
                    />
                    </View>
                    )}
                </React.Fragment>
                ))}
            </View>
            </View>
          
                {/* Form Inputs */}
                <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#999"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

                <View style={styles.inputGroup}>
                  <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.emailAddress && <Text style={styles.errorText}>{errors.emailAddress}</Text>}

                <View style={styles.inputGroup}>
                  <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contact"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

                {/* Gender Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Gender</Text>
                  <View style={styles.optionsContainer}>
                    {genderOptions.map(renderGenderOption)}
                  </View>
                  {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                </View>

                {/* Rental Period */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rental Date/Time</Text>
                    <View style={styles.optionsContainer}>
                    {rentalOptions.map(renderRentalPeriodOption)}
                    </View>
                </View>

                {/* Date Selection */}
                <View style={styles.section}>
                  <View style={styles.dateRow}>
                    {/* Pickup Date */}
                    <View style={styles.dateColumn}>
                      <Text style={styles.sectionTitle}>Pick up Date</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      setActiveDateType("pickup");
                      setShowDateTimeModal(true);
                    }}
                    activeOpacity={0.7}
                  >

                        <Icon name="date-range" size={18} color="#666" />
                        <Text style={styles.dateText}>
                          {rentalPeriod === "Hour"
                            ? pickupDate
                                .toLocaleTimeString([], { hour: "numeric", hour12: true })
                                .replace(" ", ":00 ") // ✅ force :00
                            : formatDate(pickupDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.verticalLine} />


                    {/* Return Date */}
                    <View style={styles.dateColumn}>
                      <Text style={styles.sectionTitle1}>Return Date</Text>
<TouchableOpacity
  style={styles.dateButton}
  onPress={() => {
    setActiveDateType("return");
    setShowDateTimeModal(true);
  }}
  activeOpacity={0.7}
>

                        <Icon name="date-range" size={18} color="#666" />
                        <Text style={styles.dateText}>
                          {rentalPeriod === "Hour"
                            ? returnDate
                                .toLocaleTimeString([], { hour: "numeric", hour12: true })
                                .replace(" ", ":00 ") // ✅ force :00
                            : formatDate(returnDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {/* Location Input */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle3}>Location</Text>
                  <View style={styles.locationContainer}>
                    <Icon name="location-pin" size={20} color="#666" style={styles.locationIcon} />
                    <TextInput
                      style={styles.locationInput}
                      placeholder="Wawa Pinamalayan Oriental Mindoro"
                      placeholderTextColor="#999"
                      value={location}
                      onChangeText={setLocation}
                      multiline
                    />
                  </View>
                  {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
                </View>


                {/* Guarantor Input */}
                <View style={styles.guarantorSection}>
                  <Text style={styles.sectionTitle3}>Guarantor 1</Text>
                  <View style={styles.locationContainer}>
                    <FolderPen size={20} color="#666" style={styles.locationIcon} />
                    <TextInput
                      style={styles.locationInput}
                      placeholder="Full Name"
                      placeholderTextColor="#999"
                      value={guarantor1FullName}
                      onChangeText={setGuarantor1FullName}
                      multiline
                    />
                  </View>
                  {errors.guarantor1FullName && <Text style={styles.errorText}>{errors.guarantor1FullName}</Text>}
                </View>
                <View style={styles.guarantorSection}>
                  <View style={styles.locationContainer}>
                    <Icon name="phone" size={20} color="#666" style={styles.locationIcon} />
                    <TextInput
                      style={styles.locationInput}
                      placeholder="Phone Number"
                      placeholderTextColor="#999"
                      value={guarantor1PhoneNumber}
                      onChangeText={setGuarantor1PhoneNumber}
                      keyboardType="phone-pad"
                      multiline
                    />
                  </View>
                  {errors.guarantor1PhoneNumber && <Text style={styles.errorText}>{errors.guarantor1PhoneNumber}</Text>}
                </View>
                <View style={styles.guarantorSection}>
                  <View style={styles.locationContainer}>
                    <Icon name="location-pin" size={20} color="#666" style={styles.locationIcon} />
                    <TextInput
                      style={styles.locationInput}
                      placeholder="Address"
                      placeholderTextColor="#999"
                      value={guarantor1Address}
                      onChangeText={setGuarantor1Address}
                      multiline
                    />
                  </View>
                  {errors.guarantor1Address && <Text style={styles.errorText}>{errors.guarantor1Address}</Text>}
                </View>
                <View style={styles.guarantorSection}>
                  <View style={styles.locationContainer}>
                    <Icon name="email" size={20} color="#666" style={styles.locationIcon} />
                    <TextInput
                      style={styles.locationInput}
                      placeholder=" Email Address"
                      placeholderTextColor="#999"
                      value={guarantor1Email}
                      onChangeText={setGuarantor1Email}
                      keyboardType="email-address"
                      multiline
                    />
                  </View>
                  {errors.guarantor1Email && <Text style={styles.errorText}>{errors.guarantor1Email}</Text>}
                </View>
                {/* Guarantor Input */}
                <View style={styles.guarantorSection}>
                  <Text style={styles.sectionTitle3}>Guarantor 2</Text>
                  <View style={styles.locationContainer}>
                    <FolderPen size={20} color="#666" style={styles.locationIcon} />
                    <TextInput
                      style={styles.locationInput}
                      placeholder="Full Name"
                      placeholderTextColor="#999"
                      value={guarantor2FullName}
                      onChangeText={setGuarantor2FullName}
                      multiline
                    />
                  </View>
                  {errors.guarantor2FullName && <Text style={styles.errorText}>{errors.guarantor2FullName}</Text>}
                </View>
                <View style={styles.guarantorSection}>
                <View style={styles.locationContainer}>
                  <Icon name="phone" size={20} color="#666" style={styles.locationIcon} />
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Phone Number"
                    placeholderTextColor="#999"
                    value={guarantor2PhoneNumber}
                    onChangeText={setGuarantor2PhoneNumber}
                    keyboardType="phone-pad"
                    multiline
                  />
                </View>
                {errors.guarantor2PhoneNumber && <Text style={styles.errorText}>{errors.guarantor2PhoneNumber}</Text>}
              </View>
              <View style={styles.guarantorSection}>
              <View style={styles.locationContainer}>
                <Icon name="location-pin" size={20} color="#666" style={styles.locationIcon} />
                <TextInput
                  style={styles.locationInput}
                  placeholder="Address"
                  placeholderTextColor="#999"
                  value={guarantor2Address}
                  onChangeText={setGuarantor2Address}
                  multiline
                />
              </View>
              {errors.guarantor2Address && <Text style={styles.errorText}>{errors.guarantor2Address}</Text>}
            </View>
            <View style={styles.guarantorSection}>
              <View style={styles.locationContainer}>
                <Icon name="email" size={20} color="#666" style={styles.locationIcon} />
                <TextInput
                  style={styles.locationInput}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={guarantor2Email}
                  onChangeText={setGuarantor2Email}
                  keyboardType="email-address"
                  multiline
                />
              </View>
              {errors.guarantor2Email && <Text style={styles.errorText}>{errors.guarantor2Email}</Text>}
            </View>
                          

 
                {/* Proceed Button */}
                <TouchableOpacity 
                    style={[styles.proceedButton, loading && styles.disabledButton]}
                    onPress={handleProceedToPayment}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.proceedText}>
                    {loading ? "Processing..." : "Proceed to Payment"}
                    </Text>
                </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </>
        )}
        <DateTimePickerModalUI
          visible={showDateTimeModal}
          initialDate={activeDateType === "pickup" ? pickupDate : returnDate}
          onCancel={() => setShowDateTimeModal(false)}
          onDone={(selectedDate) => {
            if (activeDateType === "pickup") {
              setPickupDate(selectedDate);
              if (returnDate < selectedDate) {
                const newReturn = new Date(selectedDate);
                newReturn.setHours(newReturn.getHours() + 1);
                setReturnDate(newReturn);
              }
            } else {
              if (selectedDate < pickupDate) {
                Alert.alert("Invalid Date", "Return date cannot be before pickup date");
                return;
              }
              setReturnDate(selectedDate);
            }
            setShowDateTimeModal(false);
          }}
        />
        </ScreenWrapper>
    );

}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF",
  },
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
  headerWrapper: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginTop: 25,
  },
  pageName: {
    fontWeight: "600",
    color: "#000",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    marginTop: 25,
  },
  headerSpacer: {
    width: 40,
  },
  timeSection: { marginBottom: 16 },
  timeLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  timeBoxActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#057474",
    padding: 10,
    borderRadius: 8,
    gap: 6,
    justifyContent: "center",
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
    fontWeight: "600" 
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  monthText: { fontSize: 16, fontWeight: "600" },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  weekText: { width: 36, textAlign: "center", color: "#777", fontSize: 12 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: 36, height: 36, justifyContent: "center", alignItems: "center", marginVertical: 6, borderRadius: 18 },
  daySelected: { backgroundColor: "#057474" },
  dayText: { color: "#333" },
  dayTextSelected: { color: "#FFF", fontWeight: "600" },
  dayDisabled: { opacity: 0.3 },
  dayTextDisabled: { color: "#ccc" },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelBtn: { borderWidth: 1, borderColor: "#057474", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  cancelText: { color: "#057474", fontWeight: "600" },
  doneBtn: { backgroundColor: "#057474", paddingVertical: 10, paddingHorizontal: 28, borderRadius: 20 },
  doneText: { color: "#FFF", fontWeight: "600" },
  timeModal: { width: "80%", backgroundColor: "#FFF", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "600", textAlign: "center", marginBottom: 12 },
  timeOption: { paddingVertical: 14, alignItems: "center" },
  timeOptionText: { fontSize: 18, color: "#057474" },
  
  // Progress Steps
  progressContainer: {
    backgroundColor: "#FFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginRight: 20,
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: "#057474",
  },
  completedStepCircle: {
    backgroundColor: "#057474",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeStepNumber: {
    color: "#FFF",
  },
  stepName: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  activeStepName: {
    color: "#057474",
    fontWeight: "600",
  },
  progressLine: {
    height: 2,
    backgroundColor: "#ccc",
    width: 94,            
    marginBottom: 25,
  },

  lineWrapper: {
    width: 40,            // same as line width to reserve space
    alignItems: "center", // center the line
  },

  completedProgressLine: {
    backgroundColor: "#4CAF50",
  },


  // Content
  scrollContent: {
    paddingBottom: 50,
   
  },
  inputContainer: {
    paddingHorizontal: 17,
    paddingTop: 17,
    borderColor: "#057474",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderWidth: 1,
    borderColor: "#057474",
        
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 16,
    
  },

  section: {
    marginBottom: 24,
  },
  guarantorSection: {
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },

  optionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 1,
    borderRadius: 25,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    borderColor: "#05747480",
  },
  selectedOptionButton: {
    backgroundColor: "#057474E5",
    borderColor: "#057474",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#FFF",
    fontWeight: "600",
  },

  // Date Selection
   sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginLeft: 12,
  },
   sectionTitle1: {
    flexDirection: "row",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 66,
    marginTop: 11,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#05747480", 
    borderRadius: 20,
    overflow: "hidden", // ✅ clip children edges
},

  dateColumn: {
    flex: 1,
    flexDirection: "column",
  },
  dateButton: {
    flex: 1,
    flexDirection: "row", // ensures icon and text are in a row
    alignItems: "center", // vertically centers icon and text
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 45,
    marginLeft: 13,
  
  },
  dateButton1: {
    flex: 1,
    flexDirection: "row", // ensures icon and text are in a row
    alignItems: "center", // vertically centers icon and text
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 45,
    marginLeft: 3,
  
  },
  dateText: {
    marginLeft: 5, // space between icon and text
    fontSize: 14,
    color: "#333",
  },

  verticalLine: {
    width: 1.5,              
    height: 50,           
    backgroundColor: "#05747480", 
    marginHorizontal: 10,  
    marginTop: 13,
    
  },

  // Location
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    borderColor: "#05747480",
    borderWidth: 1,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    textAlignVertical: "top",
    minHeight: 40,
  },

  locationIcon: {
    marginTop: 10, // adjust as needed
  },
  sectionTitle3: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 10,
    marginLeft: 12,
  },

  // Proceed Button
  proceedButton: {
    width: "70%",
    backgroundColor: "#057474",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    top: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginLeft: 50,
  },
  disabledButton: {
    opacity: 0.6,

  },
  proceedText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 1,
    marginLeft: 16,
  },
  
});

