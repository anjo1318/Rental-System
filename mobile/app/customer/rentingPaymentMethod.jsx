import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/header3";
import ScreenWrapper from "../components/screenwrapper";


export default function RentingPaymentMethod({ bookingData, onBack, onContinue }) {
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({
    distanceKm: 0,
    deliveryFee: 0,
  });
  const [customerBarangay, setCustomerBarangay] = useState("");
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  
  const router = useRouter();

  const steps = ["Booking Details", "Payment Details", "Confirmed"];

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setCustomerBarangay(`${user.barangay}`);
        console.log("From local storgae nandito ito sa rentingPyanmentMethod barangay", user.barangay);

      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

    useEffect(() => {
      loadUserData();
    }, []);
    
    useEffect(() => {
      if (!bookingData || !customerBarangay) return;
    
      const loadDeliveryFee = async () => {
        setIsCalculatingFee(true);
        const result = await calculateDeliveryFee();
        setDeliveryInfo(result);
        setIsCalculatingFee(false);
      };
    
      loadDeliveryFee();
    }, [bookingData, customerBarangay]);
  
  
    const geocodeLocation = async ({ location }) => {
      // Try multiple search strategies
      const searchStrategies = [
        `Barangay ${location}, Pinamalayan, Oriental Mindoro, Philippines`,
        `${location}, Pinamalayan, Oriental Mindoro, Philippines`,
        `Pinamalayan, Oriental Mindoro, Philippines`, // Fallback to town center
      ];
    
      for (const address of searchStrategies) {
        try {
          const query = encodeURIComponent(address);
          const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    
          const res = await fetch(url, {
            headers: { "User-Agent": "rental-app" },
          });
    
          const data = await res.json();
    
          if (data && data.length > 0) {
            console.log(`✅ Found location using: ${address}`);
            return {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            };
          }
        } catch (error) {
          console.log(`❌ Failed to find: ${address}`);
          continue;
        }
      }
    
      throw new Error(`Could not geocode any variation of: ${location}`);
    };
    
    const getDistanceKm = async (from, to) => {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
    
      const res = await fetch(url);
      const data = await res.json();
    
      if (!data.routes?.length) {
        throw new Error("Distance calculation failed");
      }
    
      return data.routes[0].distance / 1000; // meters → km
    };
    
    const calculateDeliveryFee = async () => {
      try {
        // ✅ TWO VARIABLES ONLY
        const customerLocation = customerBarangay;
        const itemLocation = bookingData?.itemDetails?.location;
    
        if (!customerLocation || !itemLocation) {
          return { distanceKm: 0, deliveryFee: 0 };
        }
    
        const customerCoords = await geocodeLocation({
          location: customerLocation,
        });
    
        const itemCoords = await geocodeLocation({
          location: itemLocation,
        });
    
        const distanceKm = await getDistanceKm(itemCoords, customerCoords);
        const deliveryFee = distanceKm * 10;
    
        return {
          distanceKm: distanceKm.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
        };
      } catch (error) {
        console.error("Delivery fee error:", error.message);
        return { distanceKm: 0, deliveryFee: 0 };
      }
    };
    
  // ✅ Calculate pricing based on rental period
  const calculatePricing = () => {
    if (!bookingData?.itemDetails?.pricePerDay || !bookingData?.rentalDetails) {
      return {
        rateLabel: "Rate Per Day",
        rate: 0,
        duration: 0,
        deliveryCharge: deliveryInfo.deliveryFee,
        grandTotal: deliveryInfo.deliveryFee,
      };
    }

    const { period, duration, pickupDate, returnDate } = bookingData.rentalDetails;
    const basePrice = parseFloat(bookingData.itemDetails.pricePerDay);

    let rateLabel = "Rate Per Day";
    let rate = basePrice;
    let actualDuration = duration;
    let isSameDayRental = false;

    // ✅ ALWAYS check if same day rental first
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const pickupDay = new Date(pickup.getFullYear(), pickup.getMonth(), pickup.getDate());
    const returnDay = new Date(returnD.getFullYear(), returnD.getMonth(), returnD.getDate());
    
    if (pickupDay.getTime() === returnDay.getTime()) {
      // Same day - treat as hourly
      isSameDayRental = true;
      rateLabel = "Rate Per Hour";
      rate = basePrice / 24;
      actualDuration = duration; // duration is already in hours
    } else {
      // Different days - treat as daily
      rateLabel = "Rate Per Day";
      rate = basePrice;
      actualDuration = duration; // duration is already in days
    }

    const subtotal = rate * actualDuration;
    const grandTotal = subtotal + Number(deliveryInfo.deliveryFee);

    return {
      rateLabel,
      rate: rate.toFixed(2),
      duration: actualDuration,
      deliveryCharge: deliveryInfo.deliveryFee,
      grandTotal: grandTotal.toFixed(2),
      period: isSameDayRental ? "Hour" : "Day",
      isSameDayRental,
    };
  };
  

  // ✅ Format date/time based on period
  const formatDateTime = (date, period) => {
    if (!date) return "N/A";
    
    const dateObj = new Date(date);
    
    if (period === "Hour") {
      // Show time for hourly rentals
      return dateObj.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      // Show date for daily/weekly rentals
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    }
  };


   const pricing = calculatePricing();

    console.log("Customer:", customerBarangay);
    console.log("Item:", bookingData?.itemDetails?.location);
    console.log("Delivery info:", deliveryInfo);


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

  return (
         <ScreenWrapper>    
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

      <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingBottom: 50}}
>

        {/* ✅ Rental Usage Section */}
        <View style={styles.rentalUsageCard}>
          <Text style={styles.cardTitle}>Rental Usage</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {pricing.period === "Hour" ? "Time Picked-Up" : "Date Picked-Up"}
            </Text>
            <Text style={styles.infoValue}>
              {formatDateTime(bookingData?.rentalDetails?.pickupDate, pricing.period)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {pricing.period === "Hour" ? "Time Return" : "Date Return"}
            </Text>
            <Text style={styles.infoValue}>
              {formatDateTime(bookingData?.rentalDetails?.returnDate, pricing.period)}
            </Text>
          </View>
        </View>

        {/* ✅ Unit Price Section */}
        <View style={styles.unitPriceCard}>
          <Text style={styles.cardTitle}>Unit Price</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{pricing.rateLabel}</Text>
            <Text style={styles.infoValue}>₱ {pricing.rate}</Text>
          </View>

          <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rental Duration</Text>
          <Text style={styles.infoValue}>
            {pricing.duration} {
              pricing.isSameDayRental || pricing.period === "Hour" 
                ? "hours" 
                : pricing.period === "Week" 
                ? "weeks" 
                : "days"
            }
          </Text>
        </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Charge</Text>
            <Text style={styles.infoValue}>
              {isCalculatingFee ? "Calculating..." : `₱ ${pricing.deliveryCharge}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              {isCalculatingFee ? "Calculating..." : `₱ ${pricing.grandTotal}`}
            </Text>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.contentWrapper}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {["Cash on Delivery", "Gcash"].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.option,
                selectedMethod === method && styles.optionSelected
              ]}
              onPress={() => setSelectedMethod(method)}
            >
              <Text style={styles.optionText}>{method}</Text>

              {/* Circle indicator on the right */}
              <View style={[
                styles.circle,
                selectedMethod === method && styles.circleSelected
              ]} />
            </TouchableOpacity>
          ))}
        </View>
              {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: "#057474", fontWeight: "700"}}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (!selectedMethod) return;
            onContinue({ 
              ...bookingData, 
              paymentMethod: selectedMethod,
              pricing: pricing // ✅ Pass pricing data to confirmation
            });
          }}
          style={[styles.continueBtn, !selectedMethod && styles.disabledBtn]}
          disabled={!selectedMethod}
        >

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "#FFF", fontWeight: "700" }}>
              {isCalculatingFee ? "Calculating..." : `₱ ${pricing.grandTotal}`}
            </Text>

            <Text style={{ color: "#FFF", fontWeight: "700" }}>
              Continue
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      </ScrollView>

   </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f6f6f6",
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

  progressContainer: {
    backgroundColor: "#fff",
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
    width: 40,
    alignItems: "center",
  },

  completedProgressLine: {
    backgroundColor: "#4CAF50",
  },

  // ✅ Rental Usage & Unit Price Cards
  rentalUsageCard: {
    width: "95%",
    alignSelf: "center",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  unitPriceCard: {
    width: "95%",
    alignSelf: "center",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },

  infoValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },

  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  grandTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#057474",
  },

  sectionTitle:{ 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 16 
  },

  contentWrapper: {
    width: "95%",
    alignSelf: "center",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 100, // Space for buttons
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },

  optionSelected: {
    borderColor: "#057474",
    backgroundColor: "#E0F7F7",
  },

  optionText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },

  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#057474",
    backgroundColor: "#FFF",
  },

  circleSelected: {
    backgroundColor: "#057474", 
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingTop: 10,
  },

  backBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginRight: 8,
    borderColor: "#057474",
    borderWidth: 1,
    alignItems: "center",
  },

  continueBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#057474",
    borderRadius: 20,
    marginLeft: 8,
    alignItems: "center",
  },

  disabledBtn: {
    opacity: 0.5,
  },
});