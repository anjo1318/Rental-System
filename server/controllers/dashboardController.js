import Customer from "../models/Customer.js";
import Owner from "../models/Owner.js";
import Item from "../models/Item.js";
import Books from "../models/Book.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalOwners,
      totalItems,
      totalBookings
    ] = await Promise.all([
      Customer.count(),
      Owner.count(),
      Item.count(),
      Books.count()
    ]);

    res.status(200).json({
      totalCustomers,
      totalOwners,
      totalItems,
      totalBookings
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message
    });
  }
};
