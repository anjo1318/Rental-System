import Item from "../models/Item.js";
import Owner from "../models/Owner.js";

const fetchItems = async (req, res) => {
  try {
    const response = await Item.findAll({
      include: [
        {
          model: Owner,
          attributes: ["id", "firstName", "lastName", "email", "profileImage"], // pick only needed fields
        },
      ],
    });

    return res.status(200).json({ success: true, message: response });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { fetchItems };
