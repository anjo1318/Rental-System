import Review from "../models/Review.js";

export const reviewProduct = async (req, res) => {
  try {
    const {
      itemId,
      customerId,
      ownerId,
      firstName,
      lastName,
      description,
      starRating,
    } = req.body;

    // Validation
    if (
      !itemId ||
      !customerId ||
      !ownerId ||
      !firstName ||
      !lastName ||
      !description ||
      !starRating
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate star rating is between 1 and 5
    if (starRating < 1 || starRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Star rating must be between 1 and 5",
      });
    }

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      where: {
        itemId,
        customerId,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await Review.create({
      itemId,
      customerId,
      ownerId,
      firstName,
      lastName,
      description,
      starRating,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      success: false,
      message: "Error submitting review",
      error: error.message,
    });
  }
};

// Optional: Get reviews for an item
export const getItemReviews = async (req, res) => {
  try {
    const { itemId } = req.params;

    const reviews = await Review.findAll({
      where: { itemId },
      order: [["createdAt", "DESC"]],
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.starRating, 0) /
          reviews.length
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: avgRating.toFixed(1),
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};
