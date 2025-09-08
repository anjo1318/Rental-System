import Customer from "../models/Customer.js";
import bcrypt from 'bcryptjs';


const mobileSignUp = async (req, res) => {
    try {
        const {firstName, 
            middleName, 
            lastName, 
            emailAddress, 
            phoneNumber, 
            birthday, 
            gender, 
            password, 
            houseNumber, 
            street, 
            barangay, 
            town, 
            country, 
            province, 
            zipCode,
            guarantor1FullName, 
            guarantor1Address, 
            guarantor1MobileNumber, 
            guarantor2FullName, 
            guarantor2Address, 
            guarantor2MobileNumber,
            idType, 
            idNumber, 
            idPhoto, 
        } = req.body;

        console.log("Incoming data from sign up page in mobile app");
        console.log(req.body);

        const existingUser = await Customer.findOne({where: { emailAddress }});

        const hashedPassword = await bcrypt.hash(password, 10);

        if(!existingUser){
            await Customer.create({
                firstName,
                middleName,
                lastName,
                emailAddress, 
                phoneNumber, 
                birthday,
                gender,
                password: hashedPassword,
                houseNumber,
                street,
                barangay,
                town, 
                country,
                province,
                zipCode,
                guarantor1FullName,
                guarantor1Address,
                guarantor1MobileNumber,
                guarantor2FullName,
                guarantor2Address,
                guarantor2MobileNumber,
                idType,
                idNumber,
                idPhoto
             });
        } else {
            return res.status(400).json({success: false, message: "Email already registered"});
        }
        
        return res.status(200).json({success: true, message: `${emailAddress} successfully signed up`});

    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}


export {mobileSignUp};
