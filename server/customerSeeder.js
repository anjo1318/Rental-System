import Customer from "./models/Customer.js";
import bcrypt from "bcryptjs";

const customerSeeder = async () => {
  try {
    const customers = [
      {
        firstName: "Vince",
        middleName: "M.",
        lastName: "Malicsi",
        emailAddress: "vjmalicsi08@gmail.com",
        phoneNumber: "09506067591",
        birthday: "2003-11-08",
        gender: "Male",
        password: await bcrypt.hash("vince", 10),
        houseNumber: "123",
        street: "Main Street",
        barangay: "Barangay Pinagtongulan",
        town: "Lipa City",
        country: "Philippines",
        province: "Batangas",
        zipCode: "4217",
        guarantor1FullName: "Jash Vien M. Malicsi",
        guarantor1Address: "Barangay Pinagtongulan, Lipa City",
        guarantor1MobileNumber: "09179876543",
        guarantor2FullName: "Jhianne M. Malicsi",
        guarantor2Address: "789 Another St, Calapan City",
        guarantor2MobileNumber: "09171239876",
        idType: "Driver’s License",
        idNumber: "DL-1234567",
        idPhoto: "idphoto-johndoe.png",
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
