import History from "../models/History.js";

export const fetchHistory = async (req, res) => {
  const { id } = req.params; // id === customerId

  try {
    const history = await History.findAll({
      where: { customerId: id },
    });

    if (!history || history.length === 0) {
      return res.status(404).json({
        success: false,
        message: "History not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: history,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Fetching history failed",
    });
  }
};

export const fetchOwnerHistory = async (req, res) => {
  const { id } = req.params; // id === customerId

  try {
    const history = await History.findAll({
      where: { ownerId: id },
    });

    if (!history || history.length === 0) {
      return res.status(404).json({
        success: false,
        message: "History not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: history,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Fetching history failed",
    });
  }
};
