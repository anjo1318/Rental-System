import Admin from "./models/Admin.js"
import bcrypt from 'bcrypt';

const adminSeeder = async () => {
    try {
        const admins = [
        {  
            name: "Vince",
            email: "vjmalicsi08@gmail.com",
            password: await bcrypt.hash("vince", 10)
        },
        {
            name: "admin",
            email: "admin@gmail.com",
            password: await bcrypt.hash("admin", 10)
        }
        ]

        for (const admin of admins) {
            const existingAdmin = await Admin.findOne({where: {email: admin.email}});
            if(!existingAdmin) {
                await Admin.create(admin);
                console.log(`Admin created ${admin.email}`);
            } else {
                console.log("Error adding admin");
            }
        }
    } catch (error) {
        console.log("Error adding seeding admin", error);
    }
}


adminSeeder();
