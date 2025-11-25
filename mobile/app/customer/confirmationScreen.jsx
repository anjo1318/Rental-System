import React, { useState } from "react";
import {View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  StatusBar,
  Linking
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function RentingPaymentMethod({ bookingData, onBack, onContinue }) {
  const [currentStep, setCurrentStep] = useState(3);
  const [selectedMethod, setSelectedMethod] = useState(
    bookingData?.paymentMethod || null
  );
  const steps = ["Booking Details", "Payment Details", "Confirmed"];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  const confirmRent = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (bookingData?.paymentMethod === "Gcash") {
        // ✅ Hit your Express backend, which calls PayMongo
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/api/payment/gcash`,
          {
            amount: bookingData.itemDetails.pricePerDay * 100, // PayMongo expects centavos
            description: `Rental for ${bookingData.itemDetails.title}`,
          }
        );

        const checkoutUrl = response.data.checkout_url || response.data.checkoutUrl;
        console.log("Redirecting to PayMongo:", checkoutUrl);

        // ✅ Open PayMongo Checkout in browser
        await Linking.openURL(checkoutUrl);

      } else {

        console.log("Booking ID to update:", bookingData.itemId);

        // ✅ Cash on Delivery → directly confirm booking
        const response = await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/api/book/book-item/update/${bookingData.itemId}`, bookingData);

      if (response.data.success) {
        console.log("Booking success:", response.data);
        setModalVisible(true);
      } else {
        console.warn("Booking failed:", response.data);
        alert("Booking failed, please try again.");
      }
        console.log("Booking success:", response.data);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Booking/Payment error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

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
    <ScrollView
      contentContainerStyle={{ paddingBottom: 30, alignItems: "center" }}
      showsVerticalScrollIndicator={false}
    >
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

    {/* Product Image */}
    <View style={{ alignItems: "center", marginBottom: 15 }}>
      {bookingData?.itemDetails?.itemImage ? (
        <Image
          source={{ uri: bookingData.itemDetails.itemImage }}
          style={styles.productImage}
        />
      ) : (
        <Text style={{ color: "#888" }}>No image available</Text>
      )}
    </View>

    {/* Booking Details */}
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Booking Details</Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Product: </Text>
        {bookingData?.itemDetails?.title}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Category: </Text>
        {bookingData?.itemDetails?.category}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Location: </Text>
        {bookingData?.itemDetails?.location}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Price Per Day: ₱</Text>
        {bookingData?.itemDetails?.pricePerDay}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Payment Method: </Text>
        {selectedMethod || "Not selected"}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Name: </Text>
        {bookingData?.customerDetails?.fullName}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Email: </Text>
        {bookingData?.customerDetails?.email}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Phone: </Text>
        {bookingData?.customerDetails?.phone}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Address: </Text>
        {bookingData?.customerDetails?.location}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Gender: </Text>
        {bookingData?.customerDetails?.gender}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Rental Period: </Text>
        {bookingData?.rentalDetails?.period}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Pickup Date: </Text>
        {bookingData?.rentalDetails?.pickupDate
          ? new Date(bookingData.rentalDetails.pickupDate).toLocaleDateString()
          : "N/A"}
      </Text>

      <Text style={styles.detailItem}>
        <Text style={styles.label}>Return Date: </Text>
        {bookingData?.rentalDetails?.returnDate
          ? new Date(bookingData.rentalDetails.returnDate).toLocaleDateString()
          : "N/A"}
      </Text>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={{ color: "#057474", fontWeight: "700"}}>Previous</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onContinue({ ...bookingData, paymentMethod: selectedMethod });
          confirmRent();
        }}
        style={styles.continueBtn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={{ color: "#FFF", fontWeight: "700"}}>Rent Now</Text>
        )}
      </TouchableOpacity>
    </View>
    

    </ScrollView>

    {/* ✅ Success Modal */}
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Icon name="check-circle" size={60} color="#4CAF50" />
          <Text style={styles.modalText}>
            Request sent, please wait for the reply.
          </Text>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setModalVisible(false);
              setLoading(false);
              router.replace("customer/home");
            }}
          >
            <Text style={styles.modalButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  productImage: {
    width: width * 0.9,
    height: 220,
    borderRadius: 12,
    resizeMode: "cover",
  },
  detailsContainer: {
    width: width * 0.9,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  detailItem: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
  },
  label: {
    fontWeight: "600",
    color: "#000",
  },
  button: {
    backgroundColor: "#057474",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 15,
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#057474",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
     gap: 12,
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