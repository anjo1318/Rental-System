import Admin from "../models/Admin.js";
import bcrypt from 'bcrypt';

const addAdmin = async (req, rs) => {
    try {
        const {name, email, password} = req.body;
        console.log(req.body);

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingEmail = await Admin.findOne({where: email.email})

        if (existingEmail) {
            return res.status(400),json({succes: false, message: "Admin already exist"});
        }

        const newAdmin = await Admin.create({name, email, password: hashedPassword});

        return res.status(201).json({success: true, message: "Admin addedd successfully"});
    } catch (error) {
        return res.status(400).json({success: false, message: "Error in addAdmin under adminController.js"});
    }
}


export {addAdmin};
