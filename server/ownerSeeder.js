import Owner from "./models/Owner.js";
import bcrypt from "bcryptjs";
import sequelize from "./database/database.js";

const ownerSeeder = async () => {
  try {
    console.log("📋 Syncing database tables...");
    await sequelize.sync({ alter: false });
    console.log("✅ Database tables synced successfully!");

    const owners = [
      {
        firstName: "Jovi",
        middleName: "Santos",
        lastName: "Polo",
        email: "marcopolo03@gmail.com",
        phone: "09354346468",
        password: await bcrypt.hash("marco123", 10),
        birthday: "1990-05-15",
        gender: "male",
        country: "Philippines",
        province: "Oriental Mindoro",
        town: "Pinamalayan",
        barangay: "Pili",
        street: "Main Street",
        houseNumber: "123",
        zipCode: "5208",
        idType: "national_id",
        idNumber: "1234567890",
        idPhoto: null,
        selfie: null,
        isActive: true,
        isVerified: true,
        gcashQR: "N/A",
        profileImage: null,
        bio: "Gadget and electronics owner",
      },
      {
        firstName: "Henry",
        middleName: "N/A",
        lastName: "Ford",
        email: "henryford@gmail.com",
        phone: "09123456789",
        password: await bcrypt.hash("ford123", 10),
        birthday: "1985-07-20",
        gender: "male",
        country: "Philippines",
        province: "Oriental Mindoro",
        town: "Pinamalayan",
        barangay: "Commonwealth",
        street: "Quirino Highway",
        houseNumber: "456",
        zipCode: "5208",
        idType: "drivers_license",
        idNumber: "D123456789",
        idPhoto: null,
        selfie: null,
        isActive: true,
        isVerified: false,
        gcashQR: "N/A",
        profileImage: null,
        bio: "Vehicle and tools rental owner",
      },
      {
        firstName: "Juan",
        middleName: "N/A",
        lastName: "Cruz",
        email: "juan@gmail.com",
        phone: "09287492392",
        password: await bcrypt.hash("juan123", 10),
        birthday: "1992-03-10",
        gender: "male",
        country: "Philippines",
        province: "Oriental Mindoro",
        town: "Pinamalayan",
        barangay: "Calingag",
        street: "Aguinaldo Highway",
        houseNumber: "789",
        zipCode: "5208",
        idType: "passport",
        idNumber: "P987654321",
        idPhoto: null,
        selfie: null,
        isActive: true,
        isVerified: false,
        gcashQR: "N/A",
        profileImage: null,
        bio: "Furniture and utility rental owner",
      },
    ];

    for (const owner of owners) {
      const existingOwner = await Owner.findOne({
        where: { email: owner.email },
      });

      if (!existingOwner) {
        await Owner.create(owner);
        console.log(`✅ Owner created: ${owner.email}`);
      } else {
        console.log(`ℹ️  Owner already exists: ${owner.email}`);
      }
    }

    console.log("🌱 Owner seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding owners:", error);
    console.error("Full error details:", error.message);
    process.exit(1);
  }
};

export default ownerSeeder;

ownerSeeder();