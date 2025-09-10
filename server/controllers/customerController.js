import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";

// STEP 1 - Personal Info
const signupPersonalInfo = async (req, res) => {
    console.log("sign up personal info");
  try {
    const { firstName, middleName, lastName, emailAddress, phoneNumber, birthday, gender, password } = req.body;

    const existingUser = await Customer.findOne({ where: { emailAddress } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = await Customer.create({
      firstName,
      middleName,
      lastName,
      emailAddress,
      phoneNumber,
      birthday,
      gender,
      password: hashedPassword,
    });

    return res.status(201).json({ success: true, message: "Step 1 complete", customerId: newCustomer.id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// STEP 2 - Address
const signupAddress = async (req, res) => {
  try {
    const { customerId, houseNumber, street, barangay, town, province, country, zipCode } = req.body;

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await customer.update({
      houseNumber,
      street,
      barangay,
      town,
      province,
      country,
      zipCode,
    });

    return res.status(200).json({ success: true, message: "Address saved", customerId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// STEP 3 - Guarantors + ID
const signupGuarantorsAndId = async (req, res) => {

    console.log("sign up guarantors info");

  try {
    const { customerId, guarantor1FullName, guarantor1Address, guarantor1MobileNumber, guarantor2FullName, guarantor2Address, guarantor2MobileNumber, idType, idNumber, idPhoto } = req.body;

    await Customer.update(
      { guarantor1FullName, guarantor1Address, guarantor1MobileNumber, guarantor2FullName, guarantor2Address, guarantor2MobileNumber, idType, idNumber, idPhoto },
      { where: { id: customerId } }
    );

    return res.status(200).json({ success: true, message: "Step 3 complete" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// STEP 4 - Finalize (optional: set role or status)
const finalizeSignup = async (req, res) => {
    
    console.log("sign up finalize ");

  try {
    const { customerId } = req.body;

    await Customer.update(
      { role: "customer" }, // or mark as active
      { where: { id: customerId } }
    );

    return res.status(200).json({ success: true, message: "Signup completed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { signupPersonalInfo, signupAddress, signupGuarantorsAndId, finalizeSignup };
