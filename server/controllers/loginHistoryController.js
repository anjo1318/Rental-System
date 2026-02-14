import LoginHistory from "../models/LoginHistory.js";

// Get all login history (Admin only)
const getLoginHistory = async (req, res) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;

    const whereClause = role ? { role } : {};

    const loginHistory = await LoginHistory.findAndCountAll({
      where: whereClause,
      order: [['loginTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: loginHistory.rows,
      total: loginHistory.count,
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch login history'
    });
  }
};

// Get recent logins (for dashboard)
const getRecentLogins = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentLogins = await LoginHistory.findAll({
      order: [['loginTime', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: recentLogins
    });
  } catch (error) {
    console.error('Error fetching recent logins:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent logins'
    });
  }
};

export { getLoginHistory, getRecentLogins };