import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar,} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

export default function RentingPaymentMethod({ bookingData, onBack, onContinue }) {
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const router = useRouter();

  const steps = ["Booking Details", "Payment Details", "Confirmed"];

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
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
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
  
      <View style={styles.horizontalLine} />

      <View style={styles.actions}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: "#057474", fontWeight: "700"}}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={() => {
            if (!selectedMethod) return;
            onContinue({ ...bookingData, paymentMethod: selectedMethod });
        }}
        style={styles.continueBtn}
        >
        <Text style={{ color: "#FFF", fontWeight: "700"}}>Continue</Text>
        </TouchableOpacity>

      
    </View>
   </View>
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

  progressContainer: {
    backgroundColor: "#f6f6f6",
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

  sectionTitle:{ 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 16 },

  contentWrapper: {
    width: "90%",               // or a fixed width like 320
    alignSelf: "center",        // centers the container horizontally
    padding: 20,
    borderWidth: 5,
    borderColor: "transparent",
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginVertical: 16,         // spacing from other sections
  },

  option: {
    flexDirection: "row",      // put text and circle in one row
    alignItems: "center",
    justifyContent: "space-between", // push circle to the right
    padding: 5,
    borderWidth: 1,
    borderRadius: 1,
    marginBottom: 12,
    borderColor: "transparent",
  },

  optionSelected: {
    borderColor: "transparent",
    backgroundColor: "#E0F7F7",
  },

  optionText: {
    fontSize: 13,
    color: "#000",
  },
  circle: {
    width: 13,
    height: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#057474",
    backgroundColor: "#FFF",
  },

  circleSelected: {
    backgroundColor: "#057474", 
  },

  horizontalLine: {
    height: 1.5,
    backgroundColor: "#05747480",
    width: "74%",
    position: "absolute",       // absolute positioning
    top: 286,                    // distance from the top of the container
    left: "13%",                // center horizontally (adjust as needed)
    zIndex: 1,        
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 320,
  },

  backBtn: {
    padding: 14,
    paddingHorizontal: 50,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginLeft: 15,
    borderColor: "#057474",
    borderWidth: 1,
  },
  continueBtn: {
    padding: 14,
    backgroundColor: "#057474",
    borderRadius: 20,
    paddingHorizontal: 50,
    marginRight: 20,
  },
});
