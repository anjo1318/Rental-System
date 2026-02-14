import 'dotenv/config';
import LoginHistory from './models/LoginHistory.js';
import Customer from './models/Customer.js';
import Owner from './models/Owner.js';

import sequelize from './database/database.js';

const runSeeder = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected');

    // Clear existing data
    await LoginHistory.destroy({ where: {}, truncate: true });
    console.log('Cleared existing login history');

    // Get users
    const customers = await Customer.findAll({ limit: 10 });
    const owners = await Owner.findAll({ limit: 5 });

    console.log(`Found ${customers.length} customers and ${owners.length} owners`);

    const ipAddresses = [
      '192.168.1.24', '172.16.32.102', '203.45.67.89', '110.25.78.12',
      '192.168.0.15', '203.113.45.78', '172.16.0.89', '110.54.32.11'
    ];

    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 Chrome/108.0.0.0',
      'Mozilla/5.0 (iPad; CPU OS 16_1 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 Chrome/107.0.0.0'
    ];

    const platforms = ['iOS', 'Android', 'mobile'];
    const loginData = [];

    // Generate customer logins
    customers.forEach(customer => {
      const loginCount = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < loginCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const loginTime = new Date();
        loginTime.setDate(loginTime.getDate() - daysAgo);
        loginTime.setHours(loginTime.getHours() - hoursAgo);

        loginData.push({
          name: `${customer.firstName} ${customer.lastName}`,
          role: 'customer',
          loginTime,
          ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
          userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          createdAt: loginTime,
          updatedAt: loginTime
        });
      }
    });

    // Generate owner logins
    owners.forEach(owner => {
      const loginCount = Math.floor(Math.random() * 15) + 10;
      for (let i = 0; i < loginCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const loginTime = new Date();
        loginTime.setDate(loginTime.getDate() - daysAgo);
        loginTime.setHours(loginTime.getHours() - hoursAgo);

        loginData.push({
          name: `${owner.firstName} ${owner.lastName}`,
          role: 'owner',
          loginTime,
          ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
          userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          createdAt: loginTime,
          updatedAt: loginTime
        });
      }
    });

    // Insert data
    await LoginHistory.bulkCreate(loginData);

    console.log(`✅ Seeded ${loginData.length} login records`);
    console.log(`   - Customer logins: ${loginData.filter(l => l.role === 'customer').length}`);
    console.log(`   - Owner logins: ${loginData.filter(l => l.role === 'owner').length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

runSeeder();