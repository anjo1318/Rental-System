import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,Dimensions,TouchableOpacity,StatusBar,Alert,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FolderPen } from "lucide-react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import RentingPaymentMethod from "./rentingPaymentMethod";
import ConfirmationScreen from "./confirmationScreen";
import { use } from "react";

const { width, height } = Dimensions.get("window");

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

  
  // Date/Time pickers
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  
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

  // ✅ Calculate rental duration based on period type
  const calculateRentalDuration = () => {
    if (rentalPeriod === "Hour") {
      const diffMs = returnDate - pickupDate;
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return diffHours;
    } else if (rentalPeriod === "Day") {
      const diffMs = returnDate - pickupDate;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return diffDays;
    } else if (rentalPeriod === "Week") {
      const diffMs = returnDate - pickupDate;
      const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
      return diffWeeks;
    }
    return 1;
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
    <View style={styles.safe}>
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
                  <View style={styles.dateRow}>
                    {/* Pickup Date */}
                    <View style={styles.dateColumn}>
                      <Text style={styles.sectionTitle}>Pick up Date</Text>
                      <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => {
                          if (rentalPeriod === "Hour") {
                            setShowPickupTimePicker(true); // ⏰ time picker
                          } else {
                            setShowPickupDatePicker(true); // 📅 date picker
                          }
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
                          if (rentalPeriod === "Hour") {
                            setShowReturnTimePicker(true); // ⏰ time picker
                          } else {
                            setShowReturnDatePicker(true); // 📅 date picker
                          }
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
                </View>


                {/* Guarantor Input */}
                <View style={styles.guarantorSection}>
                  <Text style={styles.sectionTitle3}>Guarantor 1</Text>
                  <View style={styles.locationContainer}>
                    {/* Use Lucide's FolderPen icon */}
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
                        multiline
                    />
                    </View>
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
                        multiline
                    />
                    </View>
                </View>
                {/* Guarantor Input */}
                <View style={styles.guarantorSection}>
                  <Text style={styles.sectionTitle3}>Guarantor 2</Text>
                  <View style={styles.locationContainer}>
                    {/* Use Lucide's FolderPen icon */}
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
                        multiline
                    />
                    </View>
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
            {showPickupTimePicker && (
            <DateTimePicker
              value={pickupDate}
              mode="time"
              display="spinner"
              onChange={(event, selectedTime) => {
                setShowPickupTimePicker(false);
                if (selectedTime) {
                  const hourOnly = new Date(selectedTime);
                  hourOnly.setMinutes(0, 0, 0); // ✅ lock to :00
                  setPickupDate(hourOnly);
                }
              }}
            />
          )}

          {showReturnTimePicker && (
            <DateTimePicker
              value={returnDate}
              mode="time"
              display="spinner"
              onChange={(event, selectedTime) => {
                setShowReturnTimePicker(false);
                if (selectedTime) {
                  const hourOnly = new Date(selectedTime);
                  hourOnly.setMinutes(0, 0, 0); // ✅ lock to :00
                  setReturnDate(hourOnly);
                }
              }}
            />
          )}
        </>
        )}
    </View>
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
    paddingBottom: 20,
   
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
    marginTop: 16,
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
  
});

