import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet,  SafeAreaView, StatusBar,} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

export default function RentingPaymentMethod({ bookingData, onBack, onContinue }) {
  const [currentStep, setCurrentStep] = useState(1);
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
    <SafeAreaView style={styles.safe}>
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

      <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.sectionTitle}>Payment Method</Text>

      

      {["Cash on Delivery", "Gcash"].map((method) => (
        <TouchableOpacity
          key={method}
          style={[styles.option, selectedMethod === method && styles.optionSelected]}
          onPress={() => setSelectedMethod(method)}
        >
          <Text>{method}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={() => {
            if (!selectedMethod) return;
            onContinue({ ...bookingData, paymentMethod: selectedMethod });
        }}
        style={styles.continueBtn}
        >
        <Text style={{ color: "#FFF" }}>Continue</Text>
        </TouchableOpacity>

      </View>
    </View>
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
  option: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#ccc",
  },
  optionSelected: {
    borderColor: "#057474",
    backgroundColor: "#E0F7F7",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  backBtn: {
    padding: 14,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  continueBtn: {
    padding: 14,
    backgroundColor: "#057474",
    borderRadius: 8,
  },
});
