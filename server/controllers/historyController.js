import History from "../models/History.js";

export const fetchHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const history = await History.findByPk(id);

    if (!history) {
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
