import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,Dimensions,TouchableOpacity,StatusBar,Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import RentingPaymentMethod from "./rentingPaymentMethod";
import ConfirmationScreen from "./confirmationScreen";

const { width, height } = Dimensions.get("window");

export default function RentingDetails() {
  const router = useRouter();
  const { id, itemId } = useLocalSearchParams();
  
  // Step progress
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState(null);
  const steps = ["Renting Details", "Payment Details", "Confirmed"];
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
  
  // Date/Time pickers
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  
  // Item data
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

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


  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("From local storgae", userData);
        setUserId(user.id || "");
        setFullName(user.name || "");
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

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Please enter your full name");
      return false;
    }
    if (!emailAddress.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Validation Error", "Please enter your contact number");
      return false;
    }
    if (!location.trim()) {
      Alert.alert("Validation Error", "Please enter your location");
      return false;
    }
    if (!gender) {
      Alert.alert("Validation Error", "Please select your gender");
      return false;
    }
    return true;
  };

    const handleProceedToPayment = () => {
    if (!validateForm()) return;

    if (!item) {
        Alert.alert("Error", "Item details not loaded yet.");
        return;
    }

    const data = {
        itemId: parseInt(itemId),
        itemDetails: {
        title: item.title ?? "Unknown Product",
        category: item.category,
        location: item.location,
        itemImage: item.itemImage,
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
        },
    };

    setBookingData(data);
    console.log("booking data", data);
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
    <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
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
            onContinue={() => console.log("Done!")} 
        />
        ) : (
        // ✅ Step 1 → Renting Details (form + progress bar)
        <>
            {/* Header */}
            <View style={styles.headerWrapper}>
            <View style={styles.profileContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.pageName}>Renting Details</Text>
                <View style={styles.headerSpacer} />
            </View>
            </View>

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
                    <View
                        style={[
                        styles.progressLine,
                        currentStep > index + 1 && styles.completedProgressLine,
                        ]}
                    />
                    )}
                </React.Fragment>
                ))}
            </View>
            </View>

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

                {/* Gender Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gender</Text>
                    <View style={styles.optionsContainer}>
                    {genderOptions.map(renderGenderOption)}
                    </View>
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
                    <Text style={styles.sectionTitle}>Pick up Date</Text>
                    <View style={styles.dateContainer}>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowPickupDatePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Icon name="date-range" size={20} color="#666" />
                        <Text style={styles.dateText}>{formatDate(pickupDate)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowReturnDatePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Icon name="date-range" size={20} color="#666" />
                        <Text style={styles.dateText}>{formatDate(returnDate)}</Text>
                    </TouchableOpacity>
                    </View>
                </View>

                {/* Location Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <View style={styles.locationContainer}>
                    <Icon name="location-on" size={20} color="#666" />
                    <TextInput
                        style={styles.locationInput}
                        placeholder="Wawa Pinamalayan Oriental Mindoro"
                        placeholderTextColor="#999"
                        value={location}
                        onChangeText={setLocation}
                        multiline
                    />
                    </View>
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

            {/* ✅ Date pickers now inside fragment */}
            {showPickupDatePicker && (
            <DateTimePicker
                value={pickupDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                setShowPickupDatePicker(false);
                if (selectedDate) {
                    setPickupDate(selectedDate);
                    if (selectedDate >= returnDate) {
                    const nextDay = new Date(selectedDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setReturnDate(nextDay);
                    }
                }
                }}
            />
            )}

            {showReturnDatePicker && (
            <DateTimePicker
                value={returnDate}
                mode="date"
                display="default"
                minimumDate={new Date(pickupDate.getTime() + 24 * 60 * 60 * 1000)}
                onChange={(event, selectedDate) => {
                setShowReturnDatePicker(false);
                if (selectedDate) {
                    setReturnDate(selectedDate);
                }
                }}
            />
            )}
        </>
        )}
    </SafeAreaView>
    );

}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerWrapper: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
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
  
  // Progress Steps
  progressContainer: {
    backgroundColor: "#FFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
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
    backgroundColor: "#4CAF50",
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
    width: 40,
    height: 2,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
    marginBottom: 20,
  },
  completedProgressLine: {
    backgroundColor: "#4CAF50",
  },

  // Content
  scrollContent: {
    paddingBottom: 20,
   
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderColor: "#057474",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
        
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

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  selectedOptionButton: {
    backgroundColor: "#057474",
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
  dateContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  dateText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },

  // Location
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    textAlignVertical: "top",
    minHeight: 40,
  },

  // Proceed Button
  proceedButton: {
    backgroundColor: "#057474",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    opacity: 0.6,
  },
  proceedText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  
});

