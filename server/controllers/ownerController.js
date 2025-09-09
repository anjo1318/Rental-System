import Owner from "../models/Owner.js";

const fetchOwners = async (req, res) => {
  try {
    const response = await Owner.findAll();
    return res.status(200).json({ success: true, message: response }); // ✅ 200 OK
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { fetchOwners };
