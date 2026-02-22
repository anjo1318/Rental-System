import Review from "./models/Review.js";

const reviews = [
  // Canon Projector (itemId: 53)
  {
    itemId: 53,
    customerId: 23,
    ownerId: 5,
    firstName: "Rosales",
    lastName: "Novenario",
    description:
      "Great projector! Very clear display and easy to set up. Highly recommended for presentations.",
    starRating: 5,
  },

  // Infinite Note 4 5G (itemId: 54)
  {
    itemId: 54,
    customerId: 23,
    ownerId: 5,
    firstName: "Rosales",
    lastName: "Novenario",
    description:
      "Good phone overall. Battery life is impressive and the camera is decent for the price.",
    starRating: 4,
  },

  // MSI Gaming (itemId: 56)
  {
    itemId: 56,
    customerId: 23,
    ownerId: 6,
    firstName: "Rosales",
    lastName: "Novenario",
    description:
      "Powerful gaming laptop. Handles heavy games smoothly. A bit warm during long sessions.",
    starRating: 4,
  },

  // JBL Party Box Encore (itemId: 57)
  {
    itemId: 57,
    customerId: 23,
    ownerId: 5,
    firstName: "Rosales",
    lastName: "Novenario",
    description:
      "Excellent sound quality! Super loud and crystal clear. Perfect for parties.",
    starRating: 5,
  },

  // iPhone 11 (itemId: 58)
  {
    itemId: 58,
    customerId: 23,
    ownerId: 5,
    firstName: "Rosales",
    lastName: "Novenario",
    description:
      "iPhone 11 is in great condition. Camera is top notch and battery still holds up well.",
    starRating: 5,
  },

  // Lenovo IdeaPad (itemId: 59)
  {
    itemId: 59,
    customerId: 23,
    ownerId: 5,
    firstName: "Rosales",
    lastName: "Novenario",
    description:
      "Solid laptop for everyday use and light work. Fast enough for coding and browsing.",
    starRating: 4,
  },
];

export const seedReviews = async () => {
  try {
    // Clear existing reviews first (optional)
    await Review.destroy({ where: {} });
    console.log("🗑️  Existing reviews cleared.");

    // Insert all reviews
    await Review.bulkCreate(reviews);
    console.log(`✅ Successfully seeded ${reviews.length} reviews.`);
  } catch (error) {
    console.error("❌ Error seeding reviews:", error.message);
  }
};

// Run directly if called as a script
seedReviews();
