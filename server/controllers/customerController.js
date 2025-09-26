import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import { validationResult } from 'express-validator';
import sequelize from "../database/database.js";


const customerSignUp = async (req, res) => {

  const {
    firstName, 
    middleName, 
    lastName, 
    emailAddress, 
    phoneNumber, 
    birthday, 
    gender, 
    password, 
    houseNumber, 
    street, 
    barangay, 
    town, 
    province,
    country, 
    zipCode, 
    guarantor1FullName, 
    guarantor1Address,
    guarantor1MobileNumber,
    guarantor2FullName,
    guarantor2Address,
    guarantor2MobileNumber,
    idType,
    idNumber,
    idPhoto
  } = req.body;

  console.log("Incoming data for signup", req.body);
  try{
    const hashedPassword = await password.bcrypt.hash(10, password);
    const response = await Customer.create({
      firstName, 
      middleName,
      lastName,
      emailAddress,
      phoneNumber,
      birthday,
      gender,
      password:hashedPassword,
      houseNumber,
      street,
      barangay,
      town,
      province,
      country,
      zipCode,
      guarantor1FullName,
      guarantor1Address,
      guarantor1MobileNumber,
      guarantor2FullName,
      guarantor2Address,
      guarantor2MobileNumber,
      idType,
      idNumber,
      idPhoto
    });

    console.log(response);

    return res.status(200).json({success:true, message:"Success signing up"});
  } catch (error){
    return res.status(500).json({success:false, message: error.message});
  }
}


const fetchCustomers = async (req, res) => {
  try{
    const response = await Customer.findAll();
    return res.status(200).json({success:true, message:response});
  } catch (error) {
    return res.status(500).json({success:false, message:error});
  }
};

const updateCustomerDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Update fields with request body
    await customer.update({
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      birthday: req.body.birthday,
      gender: req.body.gender,
      houseNumber: req.body.houseNumber,
      street: req.body.street,
      barangay: req.body.barangay,
      town: req.body.town,
      province: req.body.province,
      country: req.body.country,
      zipCode: req.body.zipCode,
    });

    console.log("After the request", customer);

    console.log("Customer detail updated successfully");

    return res.status(200).json({ success: true, message: "Customer details updated", updatedCustomer: customer });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export { 
  fetchCustomers,
  updateCustomerDetails ,
  customerSignUp
};