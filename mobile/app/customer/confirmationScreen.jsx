import React, { useState, useEffect } from "react";
import {
  View,
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

export default function RentingPaymentMethod({ bookingData, onContinue }) {
  const [currentStep, setCurrentStep] = useState(3);
  const [selectedMethod, setSelectedMethod] = useState(
    bookingData?.paymentMethod || null
  );
  const steps = ["Booking Details", "Payment Details", "Confirmed"];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);


  // Format date/time based on period
  const formatDateTime = (date, period) => {
    if (!date) return "N/A";
    
    const dateObj = new Date(date);
    
    if (period === "Hour") {
      return dateObj.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Auto-check payment status every 5 seconds when QR is displayed
  useEffect(() => {
    let interval;
    if (qrModalVisible && paymentIntentId) {
      interval = setInterval(() => {
        checkPaymentStatus(paymentIntentId, true);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [qrModalVisible, paymentIntentId]);

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


  // Key changes in the payment check function:

  const checkPaymentStatus = async (intentId, silent = false) => {
    try {
      if (!silent) setCheckingPayment(true);

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/payment/status/${intentId}`
      );

      if (response.data.success) {
        const { status } = response.data;

        if (status === "succeeded") {
          // ✅ 1. Close QR modal first
          setQrModalVisible(false);
          
          // ✅ 2. Show success modal immediately
          setPaymentCompleted(true);
          setModalVisible(true);
          
          // ✅ 3. Update booking in background
          await saveBookingAfterPayment(intentId);
          
          return true;
        } else if (!silent) {
          alert(`Payment Status: ${status}\n\nPlease scan the QR code to complete payment.`);
        }
      }
      return false;
    } catch (error) {
      if (!silent) {
        console.error("Error checking payment:", error);
        alert("Error checking payment status");
      }
      return false;
    } finally {
      if (!silent) setCheckingPayment(false);
    }
  };

  // ✅ Updated: Save booking immediately after payment
  const saveBookingAfterPayment = async (intentId) => {
    try {
      console.log("Saving booking after successful payment...");
      
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/book-item/update/${bookingData.itemId}`,
        {
          ...bookingData,
          paymentIntentId: intentId,
          paymentStatus: "paid"
        }
      );

      if (response.data.success) {
        console.log("✅ Booking updated successfully:", response.data);
        return true;
      } else {
        console.error("❌ Booking update failed:", response.data);
        alert("Payment successful but booking update failed. Please contact support.");
        return false;
      }
    } catch (error) {
      console.error("❌ Error updating booking:", error.response?.data || error.message);
      alert("Payment successful but booking update failed. Please contact support with reference: " + intentId);
      return false;
    }
  };

  // ✅ Updated confirmRent for QRPh payment
// ✅ Updated confirmRent for QRPh payment
const confirmRent = async () => {
  if (loading) return;
  setLoading(true);

  try {
    if (bookingData?.paymentMethod === "QRPh") {
      // GCash redirect payment
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/payment/gcash`,
        {
          amount: parseFloat(bookingData.pricing.grandTotal) * 100,
          description: `Rental for ${bookingData.itemDetails.title}`,
          bookingData
        }
      );

      const checkoutUrl = response.data.checkout_url || response.data.checkoutUrl;
      console.log("Redirecting to PayMongo GCash:", checkoutUrl);
      await Linking.openURL(checkoutUrl);

    } else if (bookingData?.paymentMethod === "Gcash") {
      // QRPh Payment - Generate QR Code
      console.log("🔍 Sending QRPh payment request...");
      console.log("📦 BookingData being sent:", JSON.stringify(bookingData, null, 2));
      
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/payment/qrph`,
        {
          amount: parseFloat(bookingData.pricing.grandTotal) * 100,
          description: `Rental for ${bookingData.itemDetails.title}`,
          bookingData
        }
      );

      console.log("✅ QRPh Response:", response.data);

      if (response.data.success && response.data.qrCode) {
        setQrCodeData(response.data.qrCode);
        setPaymentIntentId(response.data.paymentIntentId);
        setQrModalVisible(true);
        // ✅ Auto-check will start via useEffect
      } else {
        alert("Failed to generate QR code");
      }

    } else if (bookingData?.paymentMethod === "Cash on Delivery") {
      // Cash Payment
      console.log("🔍 Sending booking request for Cash on Delivery...");
      console.log("📦 BookingData being sent:", JSON.stringify(bookingData, null, 2));
      
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/book-item/update/${bookingData.itemId}`,
        bookingData
      );

      console.log("✅ Booking Response:", response.data);

      if (response.data.success) {
        setModalVisible(true);
      } else {
        alert("Booking failed, please try again.");
      }
    } else {
      alert(`Unknown payment method: ${bookingData?.paymentMethod}`);
    }
  } catch (error) {
    // ✅ Enhanced error logging
    console.error("❌ Booking/Payment error:");
    console.error("Error message:", error.message);
    console.error("Error response:", JSON.stringify(error.response?.data, null, 2));
    console.error("Error status:", error.response?.status);
    console.error("Full error object:", error);
    
    // Show detailed error to user
    const errorMessage = error.response?.data?.error?.errors?.[0]?.detail 
      || error.response?.data?.error?.message 
      || error.response?.data?.message 
      || "Error processing your request. Please try again.";
    
    alert(`Payment Error: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};

  // ✅ Updated Success Modal to show different messages
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
        {paymentCompleted 
          ? "Your booking is confirmed. Please wait for the product to be delivered"
          : bookingData?.paymentMethod === "Cash" 
            ? "Request sent, please wait for the reply."
            : "Booking confirmed!"}
      </Text>

      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          setModalVisible(false);
          setPaymentCompleted(false);
          setLoading(false);
          router.replace("customer/home");
        }}
      >
        <Text style={styles.modalButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

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

        {/* Rental Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Rental Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {bookingData?.rentalDetails?.period === "Hour" ? "Time Picked-Up" : "Date Picked-Up"}
            </Text>
            <Text style={styles.summaryValue}>
              {formatDateTime(bookingData?.rentalDetails?.pickupDate, bookingData?.rentalDetails?.period)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {bookingData?.rentalDetails?.period === "Hour" ? "Time Return" : "Date Return"}
            </Text>
            <Text style={styles.summaryValue}>
              {formatDateTime(bookingData?.rentalDetails?.returnDate, bookingData?.rentalDetails?.period)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{bookingData?.pricing?.rateLabel}</Text>
            <Text style={styles.summaryValue}>₱ {bookingData?.pricing?.rate}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rental Duration</Text>
            <Text style={styles.summaryValue}>
              {bookingData?.pricing?.duration} {
                bookingData?.pricing?.period === "Hour" ? "hours" : 
                bookingData?.pricing?.period === "Week" ? "weeks" : "days"
              }
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charge</Text>
            <Text style={styles.summaryValue}>₱ {bookingData?.pricing?.deliveryCharge}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₱ {bookingData?.pricing?.grandTotal}</Text>
          </View>
        </View>

        {/* Customer & Item Details - keeping your existing sections */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Customer Information</Text>
          <Text style={styles.detailItem}>
            <Text style={styles.label}>Full Name: </Text>
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
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Item Information</Text>
          <Text style={styles.detailItem}>
            <Text style={styles.label}>Product: </Text>
            {bookingData?.itemDetails?.title}
          </Text>
          <Text style={styles.detailItem}>
            <Text style={styles.label}>Category: </Text>
            {bookingData?.itemDetails?.category}
          </Text>
          <Text style={styles.detailItem}>
            <Text style={styles.label}>Payment Method: </Text>
            {selectedMethod || "Not selected"}
          </Text>
        </View>

        {/* Guarantors */}
        {bookingData?.guarantors && bookingData.guarantors.length > 0 && (
          <>
            {bookingData.guarantors.map((guarantor, index) => (
              guarantor.fullName ? (
                <View key={index} style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Guarantor {index + 1}</Text>
                  <Text style={styles.detailItem}>
                    <Text style={styles.label}>Full Name: </Text>
                    {guarantor.fullName}
                  </Text>
                  <Text style={styles.detailItem}>
                    <Text style={styles.label}>Phone: </Text>
                    {guarantor.phoneNumber}
                  </Text>
                  <Text style={styles.detailItem}>
                    <Text style={styles.label}>Address: </Text>
                    {guarantor.address}
                  </Text>
                </View>
              ) : null
            ))}
          </>
        )}

        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backBtn}
          >
            <Text style={{ color: "#057474", fontWeight: "700"}}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={confirmRent}
            style={[styles.continueBtn, loading && styles.disabledBtn]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={{ color: "#FFF", fontWeight: "700"}}>
                ₱ {bookingData?.pricing?.grandTotal} Rent Now
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.qrTitle}>Scan to Pay</Text>
            <Text style={styles.qrSubtitle}>
              ₱ {qrCodeData?.amount ? (qrCodeData.amount / 100).toFixed(2) : "0.00"}
            </Text>

            {qrCodeData?.imageUrl ? (
              <Image
                source={{ uri: qrCodeData.imageUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <ActivityIndicator size="large" color="#057474" />
            )}

            <View style={styles.qrInstructions}>
              <Text style={styles.instructionTitle}>How to pay:</Text>
              <Text style={styles.instructionText}>1. Open your e-wallet app (GCash, Maya, etc.)</Text>
              <Text style={styles.instructionText}>2. Go to "Scan QR" or "Pay via QR"</Text>
              <Text style={styles.instructionText}>3. Scan the QR code above</Text>
              <Text style={styles.instructionText}>4. After successful payment wait for the system to sync</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
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
              {bookingData?.paymentMethod === "Cash" 
                ? "Request sent, please wait for the reply."
                : "Payment successful! Your booking is confirmed."}
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
    width: 40,
    alignItems: "center",
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
  summaryCard: {
    width: width * 0.9,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  summaryValue: {
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
  detailsContainer: {
    width: width * 0.9,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  detailItem: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
    lineHeight: 20,
  },
  label: {
    fontWeight: "600",
    color: "#000",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    gap: 12,
    width: width * 0.9,
  },
  backBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderColor: "#057474",
    borderWidth: 1,
    alignItems: "center",
  },
  continueBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#057474",
    borderRadius: 20,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.5,
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
  // QR Modal Styles
  qrModalContent: {
    width: width * 0.9,
    maxHeight: "90%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginTop: 20,
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#057474",
    marginBottom: 24,
  },
  qrImage: {
    width: 280,
    height: 280,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    padding: 8,
    marginBottom: 24,
  },
  qrInstructions: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    lineHeight: 20,
  },
  checkStatusBtn: {
    backgroundColor: "#057474",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  checkStatusText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});