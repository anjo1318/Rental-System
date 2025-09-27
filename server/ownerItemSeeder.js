import Owner from "./models/Owner.js";
import Item from "./models/Item.js";
import bcrypt from "bcryptjs";

const ownerItemSeeder = async () => {
  try {
    const owners = [
      {
        firstName: "Marco",
        lastName: "Polo",
        email: "marcopolo03@gmail.com",
        phone: "09354346468",
        passwordHash: await bcrypt.hash("marco123", 10),
        bio: "Team Manager and avid collector of gadgets.",        
        address: "Batangas City, Philippines",
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
        email: "henryford@gmail.com",
        phone: "09123456789",
        passwordHash: await bcrypt.hash("ford123", 10),
        bio: "Car enthusiast and entrepreneur.",
        address: "Quezon City, Philippines",
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
        email: "juan@gmail.com",
        phone: "09287492392",
        passwordHash: await bcrypt.hash("juan123", 10),
        bio: "Programmer and entrepreneur.",
        address: "Tagaytay City, Philippines",
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
        where: { email: owner.email },
      });

      if (!existingOwner) {
        // Create owner first
        const newOwner = await Owner.create({
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
          phone: owner.phone,
          passwordHash: owner.passwordHash,
          bio: owner.bio,
          address: owner.address,
          isVerified: owner.isVerified
        });

        // Attach items to this owner
        for (const item of owner.items) {
          await Item.create({ 
            ...item, 
            ownerId: newOwner.id,
            // Ensure availableQuantity defaults to quantity if not specified
            availableQuantity: item.availableQuantity || item.quantity
          });
        }

        console.log(`✅ Owner created: ${owner.email} with ${owner.items.length} items`);
      } else {
        console.log(`ℹ️  Owner already exists: ${owner.email}`);
      }
    }

    console.log("🌱 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding owners and items:", error);
  }
};

export default ownerItemSeeder;


ownerItemSeeder();