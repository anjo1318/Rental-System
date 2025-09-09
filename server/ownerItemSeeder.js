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
          },
          {
            title: "MacBook Pro 2021",
            description: "Apple M1 Pro, great for work and editing.",
            pricePerDay: 800,
            category: "Laptops",
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
        const newOwner = await Owner.create(owner);

        // Attach items to this owner
        for (const item of owner.items) {
          await Item.create({ ...item, ownerId: newOwner.id });
        }

        console.log(`Owner created: ${owner.email}`);
      } else {
        console.log(`Owner already exists: ${owner.email}`);
      }
    }
  } catch (error) {
    console.error("Error seeding owners and items:", error);
  }
};

ownerItemSeeder();
