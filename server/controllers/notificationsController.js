import UserPushToken from '../models/UserPushToken.js'

const pushToken = async(req, res) => {
    try {
      const { token, platform } = req.body;
  
      if (!token) {
        return res.status(400).json({ message: 'Token required' });
      }
  
      await UserPushToken.findOrCreate({
        where: { token },
        defaults: {
          userId: req.user.id,
          platform,
        },
      });
  
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to save token' });
    }
}

const savePushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Push token required' });
    }

    await UserPushToken.findOrCreate({
      where: { token },
      defaults: {
        userId: req.user.id,
        platform,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Push token error:', error);
    res.status(500).json({ message: 'Failed to save push token' });
  }
};

export { savePushToken, pushToken };