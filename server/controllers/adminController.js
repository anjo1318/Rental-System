import Admin from "../models/Admin.js";
import bcrypt from 'bcrypt';
import Customer from "../models/Customer.js";
import Owner from "../models/Owner.js";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized:false,
  }
});

transporter.verify((error, success)=>{
  if(error){
    console.error("SMTP Connection failer", error);
  } else {
    console.log("SMTP Server Ready in adminController");
  }
});


const addAdmin = async (req, rs) => {
    try {
        const {name, email, password} = req.body;
        console.log(req.body);

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingEmail = await Admin.findOne({where: email.email})

        if (existingEmail) {
            return res.status(400).json({succes: false, message: "Admin already exist"});
        }

        const newAdmin = await Admin.create({name, email, password: hashedPassword});

        return res.status(201).json({success: true, message: "Admin addedd successfully"});
    } catch (error) {
        return res.status(400).json({success: false, message: "Error in addAdmin under adminController.js"});
    }
}

const approveCustomer = async (req, res) => {
    console.log("approveCustomer function");
    
    try {
        const { id } = req.body; // Changed from req.params to req.body since frontend sends POST/PUT
        
        if (!id) {
            return res.status(400).json({success: false, message: "Customer ID is required"});
        }

        const customer = await Customer.findOne({where: {id}});
        
        if (!customer) {
            return res.status(404).json({success: false, message: "Customer not found"});
        }

        if (customer.isVerified) {
            return res.status(400).json({success: false, message: "Customer is already verified"});
        }

        await customer.update({isVerified: true});

        const {
            firstName,
            lastName,
            emailAddress,
            } = customer;

        console.log("Email address",customer.emailAddress);

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailAddress.trim(),
      subject: `Signup Status`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Signup Status</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${firstName} ${lastName},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Your sign up request has been <strong>APPROVED</strong>.
            </p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
                <strong>Status:</strong> Your request has been <strong>APPROVED</strong>. You can now access the EzRent application using ${emailAddress}.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions regarding your booking, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #28a745; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
             EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; font-size: 13px; color: #0c5460;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this confirmation for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true, 
            message: "Successfully approved customer request",
            data: {
                customerId: id,
                isVerified: true
            }
        });
    } catch (error) {
        console.error("Error approving customer:", error);
        return res.status(500).json({success: false, message: error.message});
    }
}

const rejectCustomer = async (req, res) => {
    console.log("rejectCustomer function");

    try {
        const { id } = req.body; // Changed from req.params to req.body
        
        if (!id) {
            return res.status(400).json({success: false, message: "Customer ID is required"});
        }

        const customer = await Customer.findOne({where: {id}});
        
        if (!customer) {
            return res.status(404).json({success: false, message: "Customer not found"});
        }

        // You can either set isVerified to false or delete the customer
        // Option 1: Set as unverified (recommended for audit trail)
        await customer.update({isVerified: false, isActive: false});
        
        // Option 2: Delete customer (uncomment if you prefer this)
        // await customer.destroy();


        const {
            firstName,
            lastName,
            emailAddress,
            } = customer;

        console.log("Customer data",customer);

        // Prepare email options
        const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailAddress.trim(),
        subject: `Signup Status`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
                <p style="margin: 5px 0 0 0; font-size: 16px;">Signup Status</p>
            </div>
            
            <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
                <h2 style="color: #333; margin-top: 0;">Dear ${firstName} ${lastName},</h2>
                
                <p style="font-size: 16px; line-height: 1.6;">
                Unfortunately, your sign up request has been <strong>REJECTED</strong>.
                </p>
                
                <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #155724;">
                    <strong>Status:</strong> Your request has been <strong>REJECTED</strong>. 
                </p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
                <p style="margin: 0; font-size: 14px;">
                    <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
                </p>
                </div>
                
                <p style="margin-top: 25px; font-size: 14px; color: #666;">
                If you have any questions regarding your booking, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
                </p>
            </div>
            
            <div style="background-color: #28a745; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
                <p style="margin: 0; font-size: 14px; color: white;">
                EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
                </p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
                <p style="margin: 0; font-size: 13px; color: #0c5460;">
                <strong>Important:</strong> This is an automated email—please do not reply. Keep this confirmation for your records.
                </p>
            </div>
            </div>
        `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true, 
            message: "Successfully rejected customer request",
            data: {
                customerId: id,
                isVerified: false,
                isActive: false
            }
        });
    } catch (error) {
        console.error("Error rejecting customer:", error);
        return res.status(500).json({success: false, message: error.message});
    }
}

const approveOwner = async (req, res) => {
  console.log("approveOwner function");

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Owner ID is required" });
    }

    const owner = await Owner.findOne({ where: { id } });

    if (!owner) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    if (owner.isVerified) {
      return res.status(400).json({ success: false, message: "Owner is already verified" });
    }

    await owner.update({ isVerified: true });

    const { firstName, lastName, email } = owner;

    console.log("Owner email:", email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Signup Status`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Signup Status</p>
          </div>
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${firstName} ${lastName},</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Your sign up request as an <strong>Owner</strong> has been <strong>APPROVED</strong>.
            </p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
                <strong>Status:</strong> Your request has been <strong>APPROVED</strong>. You can now access the EzRent application using ${email}.
              </p>
            </div>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          <div style="background-color: #28a745; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
              EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; font-size: 13px; color: #0c5460;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this confirmation for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Successfully approved owner request",
      data: { ownerId: id, isVerified: true }
    });
  } catch (error) {
    console.error("Error approving owner:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectOwner = async (req, res) => {
  console.log("rejectOwner function");

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Owner ID is required" });
    }

    const owner = await Owner.findOne({ where: { id } });

    if (!owner) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    await owner.update({ isVerified: false, isActive: false });

    const { firstName, lastName, email } = owner;

    console.log("Owner data:", owner.toJSON());

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim(),
      subject: `Signup Status`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">EzRent</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Signup Status</p>
          </div>
          <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
            <h2 style="color: #333; margin-top: 0;">Dear ${firstName} ${lastName},</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Unfortunately, your sign up request as an <strong>Owner</strong> has been <strong>REJECTED</strong>.
            </p>
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #721c24;">
                <strong>Status:</strong> Your request has been <strong>REJECTED</strong>.
              </p>
            </div>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
              </p>
            </div>
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
              If you have any questions, please contact us at <a href="mailto:ezrentofficialmail@gmail.com">ezrentofficialmail@gmail.com</a>.
            </p>
          </div>
          <div style="background-color: #28a745; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 14px; color: white;">
              EzRent Company<br>Pinamalayan, Oriental Mindoro<br>Email: ezrentofficialmail@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
            </p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; font-size: 13px; color: #0c5460;">
              <strong>Important:</strong> This is an automated email—please do not reply. Keep this confirmation for your records.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Successfully rejected owner request",
      data: { ownerId: id, isVerified: false, isActive: false }
    });
  } catch (error) {
    console.error("Error rejecting owner:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {addAdmin, approveCustomer, rejectCustomer, approveOwner, rejectOwner};
