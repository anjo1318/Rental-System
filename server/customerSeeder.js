import Customer from "./models/Customer.js";
import bcrypt from "bcryptjs";

const customerSeeder = async () => {
  try {
    const customers = [
      {
        firstName: "Anthony",
        middleName: "S.",
        lastName: "Reynes",
        emailAddress: "anthony@gmail.com",
        phoneNumber: "09065526719",
        birthday: "2003-08-23",
        gender: "male", // ENUM: 'male', 'female', 'other'
        password: await bcrypt.hash("anthony", 10),
        houseNumber: "123",
        street: "Main Street",
        barangay: "Barangay Calamba",
        town: "Calamba City",
        country: "Philippines",
        province: "Laguna", // fixed typo from "Labuna"
        zipCode: "4217",
        idType: "drivers_license", // ENUM: must be lowercase
        idNumber: "DL-1234567",
        idPhoto: "idphoto-johndoe.png",
        selfie: null, // optional field
        isActive: true,
        isVerified: false,
      },
      {
        firstName: "Vince",
        middleName: "M.",
        lastName: "Malicsi",
        emailAddress: "vjmalicsi08@gmail.com",
        phoneNumber: "09506067591",
        birthday: "2003-08-23",
        gender: "male", // ENUM: 'male', 'female', 'other'
        password: await bcrypt.hash("vince", 10),
        houseNumber: "123",
        street: "Main Street",
        barangay: "Pinagtongulan",
        town: "Lipa City",
        country: "Philippines",
        province: "Batangas", // fixed typo from "Labuna"
        zipCode: "4217",
        idType: "drivers_license", // ENUM: must be lowercase
        idNumber: "DL-1234567",
        idPhoto: "idphoto-johndoe.png",
        selfie: null, // optional field
        isActive: true,
        isVerified: false,
      },
    ];

    for (const customer of customers) {
      const existingCustomer = await Customer.findOne({
        where: { emailAddress: customer.emailAddress },
      });

      if (!existingCustomer) {
        await Customer.create(customer);
        console.log(`Customer created: ${customer.emailAddress}`);
      } else {
        console.log(`Customer already exists: ${customer.emailAddress}`);
      }
    }
  } catch (error) {
    console.log("Error seeding customers", error);
  }
};

customerSeeder();