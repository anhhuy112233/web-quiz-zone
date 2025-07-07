/**
 * Script tạo tài khoản admin cho Web Quiz Zone Production
 * Kết nối trực tiếp với MongoDB Atlas để tạo tài khoản
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://hyday23:huy123@webquizzone.hzbf0rv.mongodb.net/?retryWrites=true&w=majority&appName=webquizzone';

// Database và collection
const DB_NAME = 'exam-system';
const COLLECTION_NAME = 'users';

/**
 * Tạo tài khoản admin
 */
async function createAdminAccount() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);
    
    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await usersCollection.findOne({ 
      $or: [
        { username: 'admin' },
        { email: 'admin@webquizzone.com' }
      ]
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('   Username:', existingAdmin.username);
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      return;
    }
    
    // Hash password
    const password = 'admin123'; // Mật khẩu mặc định
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Tạo tài khoản admin
    const adminUser = {
      username: 'admin',
      email: 'admin@webquizzone.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('👤 Creating admin account...');
    const result = await usersCollection.insertOne(adminUser);
    
    if (result.acknowledged) {
      console.log('✅ Admin account created successfully!');
      console.log('📋 Account Details:');
      console.log('   Username: admin');
      console.log('   Email: admin@webquizzone.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      console.log('   ID:', result.insertedId);
      
      console.log('\n🔐 Login Information:');
      console.log('   URL: https://web-quiz-zone.vercel.app');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      
      console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    } else {
      console.log('❌ Failed to create admin account');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check MongoDB Atlas connection string');
      console.log('2. Verify network access (0.0.0.0/0)');
      console.log('3. Check database user credentials');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB Atlas');
    }
  }
}

/**
 * Tạo tài khoản teacher
 */
async function createTeacherAccount() {
  let client;
  
  try {
    console.log('\n🔗 Connecting to MongoDB Atlas for teacher account...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);
    
    // Kiểm tra xem teacher đã tồn tại chưa
    const existingTeacher = await usersCollection.findOne({ 
      $or: [
        { username: 'teacher' },
        { email: 'teacher@webquizzone.com' }
      ]
    });
    
    if (existingTeacher) {
      console.log('⚠️  Teacher account already exists!');
      return;
    }
    
    // Hash password
    const password = 'teacher123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Tạo tài khoản teacher
    const teacherUser = {
      username: 'teacher',
      email: 'teacher@webquizzone.com',
      password: hashedPassword,
      role: 'teacher',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('👨‍🏫 Creating teacher account...');
    const result = await usersCollection.insertOne(teacherUser);
    
    if (result.acknowledged) {
      console.log('✅ Teacher account created successfully!');
      console.log('📋 Teacher Account Details:');
      console.log('   Username: teacher');
      console.log('   Email: teacher@webquizzone.com');
      console.log('   Password: teacher123');
      console.log('   Role: teacher');
    }
    
  } catch (error) {
    console.error('❌ Error creating teacher account:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * Tạo tài khoản student
 */
async function createStudentAccount() {
  let client;
  
  try {
    console.log('\n🔗 Connecting to MongoDB Atlas for student account...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);
    
    // Kiểm tra xem student đã tồn tại chưa
    const existingStudent = await usersCollection.findOne({ 
      $or: [
        { username: 'student' },
        { email: 'student@webquizzone.com' }
      ]
    });
    
    if (existingStudent) {
      console.log('⚠️  Student account already exists!');
      return;
    }
    
    // Hash password
    const password = 'student123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Tạo tài khoản student
    const studentUser = {
      username: 'student',
      email: 'student@webquizzone.com',
      password: hashedPassword,
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('👨‍🎓 Creating student account...');
    const result = await usersCollection.insertOne(studentUser);
    
    if (result.acknowledged) {
      console.log('✅ Student account created successfully!');
      console.log('📋 Student Account Details:');
      console.log('   Username: student');
      console.log('   Email: student@webquizzone.com');
      console.log('   Password: student123');
      console.log('   Role: student');
    }
    
  } catch (error) {
    console.error('❌ Error creating student account:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Web Quiz Zone - Account Creation Script');
  console.log('='.repeat(50));
  
  await createAdminAccount();
  await createTeacherAccount();
  await createStudentAccount();
  
  console.log('\n🎉 Account creation completed!');
  console.log('\n📋 All Accounts Summary:');
  console.log('='.repeat(50));
  console.log('👤 Admin:    admin / admin123');
  console.log('👨‍🏫 Teacher:  teacher / teacher123');
  console.log('👨‍🎓 Student:  student / student123');
  console.log('\n🌐 Login URL: https://web-quiz-zone.vercel.app');
}

// Run script
main().catch(console.error); 