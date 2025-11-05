import Owner from "./models/Owner.js";
import Item from "./models/Item.js";
import bcrypt from "bcryptjs";
import sequelize from "./database/database.js";

const ownerItemSeeder = async () => {
  try {
    // ✅ Sync database tables first
    console.log("📋 Syncing database tables...");
    await sequelize.sync({ alter: false }); // Creates tables if they don't exist
    console.log("✅ Database tables synced successfully!");

    const owners = [
      {
        firstName: "Marco",
        lastName: "Polo",
        emailAddress: "marcopolo03@gmail.com",
        phoneNumber: "09354346468",
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
        isVerified: true,
        items: [
          {
            title: "Canon EOS 90D DSLR Camera",
            description: "High-quality DSLR camera, perfect for photography.",
            pricePerDay: 500,
            category: "Electronics",
            location: "Pili, Pinamalayan, Oriental Mindoro",
            quantity: 2,
            availableQuantity: 2,
            itemImages: [
              "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500",
              "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500"
            ]
          },
          {
            title: "MacBook Pro 2021",
            description: "Apple M1 Pro, great for work and editing.",
            pricePerDay: 800,
            category: "Laptops",
            location: "Bayan, Pinamalayan, Oriental Mindoro",
            quantity: 1,
            availableQuantity: 1,
            itemImages: [
              "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
              "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
            ]
          },
          {
            title: "Kouri Monitor",
            description: "High-quality Monitor, perfect for gaming.",
            pricePerDay: 500,
            category: "Electronics",
            location: "Mabini, Pinamalayan, Oriental Mindoro",
            quantity: 3,
            availableQuantity: 3,
            itemImages: [
              "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"
            ]
          },
          {
            title: "iPhone 16 Pro Max",
            description: "Strong processor and great features",
            pricePerDay: 800,
            category: "Smart phone",
            location: "Joseph Street, Pinamalayan, Oriental Mindoro",
            quantity: 1,
            availableQuantity: 1,
            itemImages: [
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
              "https://images.unsplash.com/photo-1592286948989-e139db27420f?w=500"
            ]
          },
        ],
      },
      {
        firstName: "Henry",
        lastName: "Ford",
        emailAddress: "henryford@gmail.com",
        phoneNumber: "09123456789",
        password: await bcrypt.hash("ford123", 10),
        birthday: "1985-07-20",
        gender: "male",
        country: "Philippines",
        province: "Metro Manila",
        town: "Quezon City",
        barangay: "Commonwealth",
        street: "Quirino Highway",
        houseNumber: "456",
        zipCode: "1121",
        isVerified: false,
        items: [
          {
            title: "Toyota Vios 2022",
            description: "Reliable and fuel-efficient sedan.",
            pricePerDay: 1200,
            category: "Vehicles",
            location: "Cacawan, Pinamalayan, Oriental Mindoro",
            quantity: 1,
            availableQuantity: 1,
            itemImages: [
              "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500",
              "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500"
            ]
          },
          {
            title: "Romoss Powerbank",
            description: "Long lasting powerbank",
            pricePerDay: 200,
            category: "Electronics",
            location: "Wawa, Pinamalayan, Oriental Mindoro",
            quantity: 5,
            availableQuantity: 5,
            itemImages: [
              "https://images.unsplash.com/photo-1609592806248-4b5c8a13e8a8?w=500"
            ]
          },
          {
            title: "A3 Light Pad",
            description: "Perfect for drafting",
            pricePerDay: 150,
            category: "Arts",
            location: "Buli, Pinamalayan, Oriental Mindoro",
            quantity: 2,
            availableQuantity: 2,
            itemImages: [
              "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500"
            ]
          },
          {
            title: "K500 Pro Mechanical Keyboard",
            description: "High quality mechanical keyboard",
            pricePerDay: 300,
            category: "Electronics",
            location: "Sto Nino, Pinamalayan, Oriental Mindoro",
            quantity: 3,
            availableQuantity: 3,
            itemImages: [
              "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
              "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"
            ]
          },
        ],
      },
      {
        firstName: "Juan",
        lastName: "Cruz",
        emailAddress: "juan@gmail.com",
        phoneNumber: "09287492392",
        password: await bcrypt.hash("juan123", 10),
        birthday: "1992-03-10",
        gender: "male",
        country: "Philippines",
        province: "Cavite",
        town: "Tagaytay",
        barangay: "Silang Crossing",
        street: "Aguinaldo Highway",
        houseNumber: "789",
        zipCode: "4120",
        isVerified: false,
        items: [
          {
            title: "Foldable Table",
            description: "Light weight table perfect for camping",
            pricePerDay: 250,
            category: "Utilities",
            location: "Sto Nino, Victoria, Oriental Mindoro",
            quantity: 4,
            availableQuantity: 4,
            itemImages: [
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"
            ]
          },
          {
            title: "Power Drill",
            description: "Powerful drill for construction work",
            pricePerDay: 400,
            category: "Tools",
            location: "Isidro, Gloria, Oriental Mindoro",
            quantity: 2,
            availableQuantity: 2,
            itemImages: [
              "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500",
              "https://images.unsplash.com/photo-1609119275058-f6c0f3c68ee7?w=500"
            ]
          },
        ],
      },
    ];

    for (const owner of owners) {
      const existingOwner = await Owner.findOne({
        where: { emailAddress: owner.emailAddress },
      });

      if (!existingOwner) {
        // Create owner first
        const newOwner = await Owner.create({
          firstName: owner.firstName,
          lastName: owner.lastName,
          emailAddress: owner.emailAddress,
          phoneNumber: owner.phoneNumber,
          password: owner.password,
          birthday: owner.birthday,
          gender: owner.gender,
          country: owner.country,
          province: owner.province,
          town: owner.town,
          barangay: owner.barangay,
          street: owner.street,
          houseNumber: owner.houseNumber,
          zipCode: owner.zipCode,
          isVerified: owner.isVerified
        });

        // Attach items to this owner
        for (const item of owner.items) {
          await Item.create({ 
            ...item, 
            ownerId: newOwner.id,
            availableQuantity: item.availableQuantity || item.quantity
          });
        }

        console.log(`✅ Owner created: ${owner.emailAddress} with ${owner.items.length} items`);
      } else {
        console.log(`ℹ️  Owner already exists: ${owner.emailAddress}`);
      }
    }

    console.log("🌱 Seeding completed successfully!");
    process.exit(0); // Exit after seeding
  } catch (error) {
    console.error("❌ Error seeding owners and items:", error);
    console.error("Full error details:", error.message);
    process.exit(1); // Exit with error
  }
};

export default ownerItemSeeder;

ownerItemSeeder();