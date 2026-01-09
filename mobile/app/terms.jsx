import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AutoHeightWebView from "react-native-autoheight-webview";
import Header from "./components/header";

const { width } = Dimensions.get("window");

export default function TermsandCondition() {
  const router = useRouter();

  const buildHtml = (content) => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        html, body {
          width: 100%;
          max-width: 100%;
          overflow-wrap: break-word; /* breaks long words instead of overflowing */
          word-wrap: break-word;
          white-space: normal;
          box-sizing: border-box;
        }
        p {
          margin: 0 0 10px 0;
        }

        body {
          font-size: 13px;
          line-height: 20px;
          text-align: justify;
          text-align-last: justify;
          font-family: -apple-system, Roboto, sans-serif;
          color: #000;
          margin: 0;
          margin-bottom: 10;
          padding: 0 8px 0 0; 
        }
        b { font-weight: 600; }
      </style>
    </head>
    <body>${content}</body>
  </html>
`;

const sections = [
  {
    title: "1.  INTRODUCTION AND ACCEPTANCE OF TERMS",
    content: `
     <p><b>    1.1 </b>   EzRent is a centralized platform that allows users to rent essential gadgets and devices such as laptops, smartphones, printers, cameras, and projectors within the municipality of Pinamalayan. By registering, booking, or using the services provided by EzRent, users agree to comply with these Terms and Conditions (T&C). These terms govern the use of the platform and all transactions between users, owners, and EzRent.</p>
     <p><b>    1.2 </b>    If you do not agree with these T&C, please do not proceed with registration or use the platform.</p>
    `,
  },
  {
    title: "2.  USER ELIGIBILTY AND RESPONSIBILITIES",
    content: `
     <p><b>    2.1 </b>    Users must be at least 18 years of age to use the platform and enter into binding agreements.</p>
     <p><b> 2.2 </b> Users are responsible for providing accurate, complete, and up-to-date information during registration. Failure to do so may result in account suspension or termination.</p>
     <p><b>  2.3 </b> Users must maintain the confidentiality of their account credentials and are responsible for any activity under their account. If you believe your account has been compromised, please notify us immediately.</p>
    `,
  },
  {
    title: "3.   RENTAL PROCESS",
    content: `
      <p><b>  3.1 </b>    To rent an item, users must select the desired device, rental duration, and confirm booking via the platform. The availability of items is real-time and subject to approval by the rental provider.</p>
      <p><b>  3.2 </b>   The minimum and maximum rental durations will be displayed at the time of booking. Rentals must be completed within the agreed-upon timeframe.</p>
      <p><b>  3.3 </b>   Users must arrange for either pickup or delivery of the rented item according to the agreement between the provider and the renter.</p>
    `,
  },
  {
    title: "4.   PAYMENT TERMS",
    content: `
      <p><b>  4.1 </b>    Payments can be made through Cash on Hand or GCash</p>
      <p><b>  4.2 </b>   Payment must be made before the rental period begins. Only after payment confirmation will the booking be approved.</p>
      <p><b>  4.3 </b>   No refunds will be issued after payment is made, regardless of whether the User decides to cancel or shorten the rental period.</p>
      <p><b>  4.4 </b>   If the item is returned late, additional fees will be applied, calculated based on the time exceeded beyond the agreed rental duration. The late fee will be communicated at the time of booking and must be paid before the return of the device or the approval of any future rentals.</p>
    `,
  },
  {
    title: "5.    SECURITY DEPOSIT AND IDENTIFICATION",
    content: `
      <p><b>  5.1 </b>    A valid government-issued ID must be presented at the time of rental to verify identity.</p>
      <p><b>  5.2 </b>   No security deposit is required for rentals. However, the full rental price must be paid upfront and confirmed before the rental period begins.</p>
      <p><b>  5.3 </b>   No refund will be issued for the full payment if the device is returned early or if the rental period is shortened.</p>
    `,
  },
  {
    title: "6.   USER OBLIGATIONS DURING RENTAL",
    content: `
      <p><b>  6.1 </b>    Users are expected to handle rented devices with care and use them solely for legal and intended purposes. Misuse, illegal activities, or resale of the rented device are strictly prohibited.</p>
      <p><b>  6.2 </b>   The renter is fully responsible for the device during the rental period. In the event of loss, theft, or damage, the renter will bear the full cost of repair or replacement.</p>
      <p><b>  6.3 </b>   Users must maintain the device in the condition it was rented, including keeping it clean and free from damage. Any issues must be reported immediately to the provider.</p>
    `,
  },
  {
    title: "7.   RETURNS & LATE FEES",
    content: `
      <p><b>  7.1 </b>     The device must be returned to the provider at the agreed-upon time and location. The device should be returned in the same condition as received, with no modifications or damages.</p>
      <p><b>  7.2 </b>   A grace period of up to 24 hours may be allowed for late returns, depending on the device and rental provider. After the grace period, additional fees will be charged.</p>
      <p><b>  7.3 </b>   Fees will be charged for each additional hour or day beyond the rental duration. These fees will be communicated to the user before finalizing the rental agreement.</p>
    `,
  },
  {
    title: "8.  DAMAGES, LOSS, & LIABILITY",
    content: `
      <p><b>  8.1 </b>    In case of damage or loss, the renter will be liable for the full cost of repairs or replacement of the device. An assessment of the device will be conducted upon return to determine any damage.</p>
      <p><b>  8.2 </b>   EzRent is not liable for any indirect losses or damages caused by the rented device, including but not limited to data loss, business interruption, or missed opportunities.</p>
      <p><b>  8.3 </b>   EzRent’s only responsibility is to handle legal issues related to the rental transaction under applicable laws. This includes ensuring that rental agreements and transactions comply with the Civil Code of the Philippines and other relevant local regulations. Any disputes or legal concerns beyond the rental transaction will be the responsibility of the User.</p>
    `,
  },
  {
    title: "9.   CANCELLATIONS & REFUNDS",
    content: `
     <p><b>  9.1 </b>    Cancellations made before the item is picked up or delivered may be eligible for a full refund, minus any processing fees.</p>
    <p><b>  9.2 </b>   If the user cancels after the device has been rented but before pickup, only a partial refund may be issued. Once the rental period starts, refunds are not permitted.</p>
    `,
  },
  {
    title: "10.   PROHIBITED ACTIVITIES",
    content: `
      <p><b>  10.1 </b>    The rented devices must not be used for illegal activities, including to hacking, pirated content usage, or any unlawful behavior.</p>
      <p><b>  10.2 </b>   Users may not modify, tamper with, or attempt to repair the rented devices. Unauthorized repairs will result in penalties or further charges.</p>
      <p><b>  10.3 </b>   The rented device must not be lent, rented, or transferred to any third party. The user is fully responsible for the item during the rental period.</p>
    `,
  },
  {
    title: "11.   GUARANTORS",
    content: `
     <p><b>  11.1 </b>    Upon registering and renting a device, the User agrees to provide two (2) guarantors who will act as additional contacts in case the User fails to fulfill their obligations under this rental agreement.</p>
     <p><b>  11.2 </b>   The guarantors must be individuals who can be reached if the rented device is lost, damaged, or if the rental terms are violated. The User authorizes EzRent to contact the guarantors in case of non-compliance, such as failure to return the device, unpaid fees, or damage to the rented item.</p>
     <p><b>  11.3 </b>   The User must provide the full name, contact number, and relationship to the User for both guarantors. This information will be used solely for purposes related to the rental agreement.</p>
     <p><b>  11.4 </b>  In case the User is unable to return the device or settle any due penalties, damages, or unpaid fees, EzRent reserves the right to seek recovery from the guarantors. The guarantors agree to be responsible for the outstanding obligations if the User fails to comply with the terms and conditions.</p>
    `,
  },
  {
    title: "12.   PLATFORMS RIGHTS",
    content: `
       <p><b>  12.1 </b>     EzRent reserves the right to suspend or terminate any account for violations of these Terms and Conditions, including misuse of the platform, illegal activity, or failure to comply with payment terms.</p>
       <p><b>  12.2 </b>   EzRent reserves the right to update rental fees, policies, and terms at any time. Users will be notified of significant changes via email or platform notifications.
    `,
  },
  {
    title: "13.   PRIVACY & DATA PROTECTION",
    content: `
      <p><b>  13.1 </b>    User data is collected and stored in accordance with local laws, including the Data Privacy Act of 2012. This data will be used for account management, payment processing, and communication.</p>
      <p><b>  13.2 </b>    EzRent will implement industry-standard security measures to protect user data and prevent unauthorized access.</p>
    `,
  },
  {
    title: "14.   DISPUTE RESOLUTION",
    content: `
      <p><b>  14.1 </b>    In case of disputes, EzRent will first attempt to mediate between the parties. If a resolution is not reached, users may seek legal recourse through mediation, arbitration, or small claims court.</p>
      <p><b>  14.2 </b>   These Terms and Conditions shall be governed by the laws of the Philippines, specifically within the jurisdiction of Pinamalayan municipality.</p>
    `,
  },
  {
    title: "15.   LIMITATION OF LIABILITY",
    content: `
      <p><b>  15.1 </b>    EzRent is not liable for any damages arising from user misconduct, such as unauthorized use or loss of data. Additionally, the platform is not responsible for technical issues that affect device functionality or disrupt the user’s ability to use the rented item.</p>
    `,
  },
  {
    title: "16.   AMENDMENTS TO TERMS",
    content: `
      <p><b>  16.1 </b>    EzRent reserves the right to update or modify these Terms and Conditions at any time. All updates will be posted on the platform, and users will be notified accordingly. By continuing to use the platform after such changes, users agree to the revised Terms.</p>
    `,
  },
   
];



  return ( 
  <View style={styles.container}>
     <Header
       title="Terms and Conditions"
       backgroundColor="#007F7F"
     />
    {/* Non-header Content */}
    <View style={styles.bodyWrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title1}>RENTAL AGREEMENT</Text>
        <Text style={styles.title2}>GENERAL TERMS AND CONDITIONS</Text>

        {/* 👉 Dynamic sections */}
        {sections.map((section, index) => (
          <View
            key={index}
            style={[
              styles.section,
              index === sections.length - 1 ? { marginBottom: 0 } : {} // remove bottom margin for last section
            ]}
          >
            <Text style={styles.subTitle1}>{section.title}</Text>
            <View style={styles.paragraphWrapper}>
              <AutoHeightWebView
                originWhitelist={["*"]}
                source={{ html: buildHtml(section.content) }}
                style={styles.webview}
                scrollEnabled={false}
              />
            </View>
          </View>
        ))}

        {/* 👉 Contact Info immediately after Section 16 */}
        <View>
          <Text style={styles.subTitle2}>Contact Information</Text>
          <Text style={styles.contactText}>
            For inquiries, disputes, or assistance, please contact our customer support team:
          </Text>

          <View style={styles.infoSpace}>
            <Text style={styles.infoText}>•  Email: ezrentsupport@gmail.com</Text>
            <Text style={styles.infoText}>•  Phone: +63927 166 8762</Text>
            <Text style={styles.infoText}>•  Address: Wawa, Pinamalayan, Oriental Mindoro</Text>
          </View>

          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Pressable style={styles.doneButton} onPress={() => console.log("Done pressed")}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title1: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    marginTop: 15,
  },
  title2: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 14,
  },
  subTitle1: {
    fontWeight: "600",
    paddingVertical: 20,
    marginLeft: 10,
    fontSize: 13,
  },
  paragraphWrapper: {
    marginHorizontal: 15,
    marginTop: -17,    // aligns closer to subtitle
  },
  webview: {
    width: "100%",
    backgroundColor: "transparent",
  },
  section: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 150, // 🔧 gives breathing room so section 16 isn’t cut
  },
  subTitle2: {
    fontWeight: "600",
    fontSize: 13,
    marginTop: 30,
    marginLeft: 17,
  },
  contactText: {
    fontSize: 12,
    marginLeft: 15,
    marginTop: 5,
    lineHeight: 18,
    textAlign: "justify",
  },
  infoText: {
    fontSize: 12,
    marginLeft: 20,
    marginTop: 5,
    lineHeight: 18,
    textAlign: "justify",
  },
  infoSpace: {
    marginBottom: 20,
  },
  doneButton: {
    width: "70%",
    backgroundColor: "#057474",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
},


  

});