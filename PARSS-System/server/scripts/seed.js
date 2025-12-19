const { sequelize } = require('../config/database');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Alert = require('../models/Alert');
const Document = require('../models/Document');
const Faculty = require('../models/Faculty');
const bcrypt = require('bcryptjs');
const logger = require('../middleware/logger');

// Database seeding script
class DatabaseSeeder {
  constructor() {
    this.seedsPath = require('path').join(__dirname, '../seeds');
  }

  // Run all seeders
  async seed() {
    try {
      logger.info('Starting database seeding...');
      
      // Check if data already exists
      const userCount = await User.count();
      if (userCount > 0) {
        logger.warn('Database already contains data. Skipping seeding to prevent duplicates.');
        logger.warn('Use --force to override this check.');
        return;
      }
      
      // Run seeders in order
      await this.seedInstitutions();
      await this.seedUsers();
      await this.seedFaculty();
      await this.seedAlerts();
      await this.seedDocuments();
      
      logger.info('Database seeding completed successfully');
      
    } catch (error) {
      logger.error('Seeding failed:', { error: error.message });
      throw error;
    }
  }

  // Seed institutions
  async seedInstitutions() {
    logger.info('Seeding institutions...');
    
    const institutions = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Delhi University',
        code: 'DU',
        type: 'university',
        address: 'North Campus, Delhi - 110007',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        postal_code: '110007',
        phone: '+91-11-27667672',
        email: 'admin@du.ac.in',
        website: 'https://www.du.ac.in',
        established_year: 1922,
        accreditation_status: 'accredited',
        admin_user_id: null, // Will be set after users are created
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Mumbai Institute of Technology',
        code: 'MIT',
        type: 'institute',
        address: 'Powai, Mumbai - 400076',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400076',
        phone: '+91-22-25767070',
        email: 'admin@mit.edu.in',
        website: 'https://www.mit.edu.in',
        established_year: 1958,
        accreditation_status: 'accredited',
        admin_user_id: null,
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Bangalore Medical College',
        code: 'BMC',
        type: 'college',
        address: 'Fort Area, Bangalore - 560001',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postal_code: '560001',
        phone: '+91-80-26707070',
        email: 'admin@bmc.edu.in',
        website: 'https://www.bmc.edu.in',
        established_year: 1955,
        accreditation_status: 'accredited',
        admin_user_id: null,
        is_active: true
      }
    ];
    
    for (const institution of institutions) {
      await Institution.create(institution);
    }
    
    logger.info(`Seeded ${institutions.length} institutions`);
  }

  // Seed users
  async seedUsers() {
    logger.info('Seeding users...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      // System Admin
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        email: 'admin@viksitbharat.gov.in',
        username: 'system_admin',
        password: hashedPassword,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'system_admin',
        is_active: true,
        is_verified: true,
        phone: '+91-9876543210',
        permissions: {
          admin: true,
          user_management: true,
          system_config: true,
          reports: true
        }
      },
      
      // Delhi University Users
      {
        id: '550e8400-e29b-41d4-a716-446655440201',
        institution_id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'principal@du.ac.in',
        username: 'du_principal',
        password: hashedPassword,
        first_name: 'Dr. Rajesh',
        last_name: 'Sharma',
        role: 'principal',
        department: 'Administration',
        position: 'Principal',
        phone: '+91-9876543211',
        is_active: true,
        is_verified: true,
        permissions: {
          institution_management: true,
          compliance_oversight: true,
          reports: true
        }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440202',
        institution_id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'compliance@du.ac.in',
        username: 'du_compliance',
        password: hashedPassword,
        first_name: 'Dr. Priya',
        last_name: 'Gupta',
        role: 'compliance_officer',
        department: 'Compliance',
        position: 'Compliance Officer',
        phone: '+91-9876543212',
        is_active: true,
        is_verified: true,
        permissions: {
          compliance_management: true,
          document_approval: true,
          alerts_management: true
        }
      },
      
      // Mumbai Institute Users
      {
        id: '550e8400-e29b-41d4-a716-446655440301',
        institution_id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'principal@mit.edu.in',
        username: 'mit_principal',
        password: hashedPassword,
        first_name: 'Dr. Suresh',
        last_name: 'Patel',
        role: 'principal',
        department: 'Administration',
        position: 'Director',
        phone: '+91-9876543213',
        is_active: true,
        is_verified: true,
        permissions: {
          institution_management: true,
          compliance_oversight: true,
          reports: true
        }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440302',
        institution_id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'compliance@mit.edu.in',
        username: 'mit_compliance',
        password: hashedPassword,
        first_name: 'Dr. Anjali',
        last_name: 'Shah',
        role: 'compliance_officer',
        department: 'Quality Assurance',
        position: 'QA Head',
        phone: '+91-9876543214',
        is_active: true,
        is_verified: true,
        permissions: {
          compliance_management: true,
          document_approval: true,
          alerts_management: true
        }
      },
      
      // Bangalore Medical College Users
      {
        id: '550e8400-e29b-41d4-a716-446655440401',
        institution_id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'principal@bmc.edu.in',
        username: 'bmc_principal',
        password: hashedPassword,
        first_name: 'Dr. Meera',
        last_name: 'Reddy',
        role: 'principal',
        department: 'Administration',
        position: 'Principal',
        phone: '+91-9876543215',
        is_active: true,
        is_verified: true,
        permissions: {
          institution_management: true,
          compliance_oversight: true,
          reports: true
        }
      }
    ];
    
    for (const user of users) {
      await User.create(user);
    }
    
    // Update institution admin_user_id
    await Institution.update(
      { admin_user_id: '550e8400-e29b-41d4-a716-446655440201' },
      { where: { id: '550e8400-e29b-41d4-a716-446655440001' } }
    );
    
    await Institution.update(
      { admin_user_id: '550e8400-e29b-41d4-a716-446655440301' },
      { where: { id: '550e8400-e29b-41d4-a716-446655440002' } }
    );
    
    await Institution.update(
      { admin_user_id: '550e8400-e29b-41d4-a716-446655440401' },
      { where: { id: '550e8400-e29b-41d4-a716-446655440003' } }
    );
    
    logger.info(`Seeded ${users.length} users`);
  }

  // Seed faculty members
  async seedFaculty() {
    logger.info('Seeding faculty...');
    
    const facultyMembers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440501',
        institution_id: '550e8400-e29b-41d4-a716-446655440001',
        employee_id: 'DU/FAC/001',
        first_name: 'Dr. Arjun',
        last_name: 'Verma',
        email: 'arjun.verma@du.ac.in',
        department: 'Computer Science',
        position: 'Professor',
        qualification: 'Ph.D. Computer Science',
        specialization: 'Artificial Intelligence',
        date_of_joining: '2010-08-15',
        phone: '+91-9876543221',
        is_permanent: true,
        compliance_status: 'compliant',
        documents_submitted: true,
        verification_status: 'verified',
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440502',
        institution_id: '550e8400-e29b-41d4-a716-446655440001',
        employee_id: 'DU/FAC/002',
        first_name: 'Dr. Kavita',
        last_name: 'Singh',
        email: 'kavita.singh@du.ac.in',
        department: 'Mathematics',
        position: 'Associate Professor',
        qualification: 'Ph.D. Mathematics',
        specialization: 'Applied Mathematics',
        date_of_joining: '2012-01-10',
        phone: '+91-9876543222',
        is_permanent: true,
        compliance_status: 'compliant',
        documents_submitted: true,
        verification_status: 'verified',
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440503',
        institution_id: '550e8400-e29b-41d4-a716-446655440002',
        employee_id: 'MIT/FAC/001',
        first_name: 'Dr. Vikram',
        last_name: 'Rao',
        email: 'vikram.rao@mit.edu.in',
        department: 'Electronics Engineering',
        position: 'Professor',
        qualification: 'Ph.D. Electronics Engineering',
        specialization: 'VLSI Design',
        date_of_joining: '2008-07-01',
        phone: '+91-9876543223',
        is_permanent: true,
        compliance_status: 'pending_review',
        documents_submitted: false,
        verification_status: 'pending',
        is_active: true
      }
    ];
    
    for (const faculty of facultyMembers) {
      await Faculty.create(faculty);
    }
    
    logger.info(`Seeded ${facultyMembers.length} faculty members`);
  }

  // Seed alerts
  async seedAlerts() {
    logger.info('Seeding alerts...');
    
    const alerts = [
      {
        id: '550e8400-e29b-41d4-a716-446655440601',
        user_id: '550e8400-e29b-41d4-a716-446655440202',
        title: 'Annual Compliance Review Due',
        message: 'The annual compliance review for your institution is due in 30 days. Please ensure all documents are updated.',
        type: 'deadline',
        priority: 'high',
        status: 'unread',
        category: 'compliance_review',
        action_required: true,
        action_url: '/compliance/annual-review',
        institution_id: '550e8400-e29b-41d4-a716-446655440001',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440602',
        user_id: '550e8400-e29b-41d4-a716-446655440302',
        title: 'New Regulatory Guidelines Published',
        message: 'New regulatory guidelines for technical education have been published. Please review and implement.',
        type: 'info',
        priority: 'medium',
        status: 'unread',
        category: 'regulatory_update',
        action_required: false,
        action_url: '/regulatory/guidelines',
        institution_id: '550e8400-e29b-41d4-a716-446655440002',
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440603',
        user_id: '550e8400-e29b-41d4-a716-446655440202',
        title: 'Faculty Documentation Update Required',
        message: '3 faculty members need to update their compliance documentation. Please follow up.',
        type: 'warning',
        priority: 'medium',
        status: 'unread',
        category: 'faculty_compliance',
        action_required: true,
        action_url: '/faculty/compliance',
        institution_id: '550e8400-e29b-41d4-a716-446655440001',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ];
    
    for (const alert of alerts) {
      await Alert.create(alert);
    }
    
    logger.info(`Seeded ${alerts.length} alerts`);
  }

  // Seed documents
  async seedDocuments() {
    logger.info('Seeding documents...');
    
    const documents = [
      {
        id: '550e8400-e29b-41d4-a716-446655440701',
        institution_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Annual Compliance Report 2024',
        description: 'Comprehensive compliance report for the year 2024',
        type: 'pdf',
        category: 'compliance_report',
        status: 'approved',
        version: '1.0',
        file_size: 2048000,
        file_path: '/uploads/compliance_report_2024.pdf',
        submitted_by: '550e8400-e29b-41d4-a716-446655440202',
        approved_by: '550e8400-e29b-41d4-a716-446655440201',
        submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        tags: ['annual', 'compliance', '2024'],
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440702',
        institution_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Faculty Qualifications Documentation',
        description: 'Supporting documents for faculty qualifications verification',
        type: 'pdf',
        category: 'faculty_qualification',
        status: 'pending',
        version: '1.0',
        file_size: 1536000,
        file_path: '/uploads/faculty_qualifications_mit.pdf',
        submitted_by: '550e8400-e29b-41d4-a716-446655440302',
        submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['faculty', 'qualifications', 'mit'],
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440703',
        institution_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Infrastructure Compliance Certificate',
        description: 'Certificate for infrastructure compliance as per regulatory requirements',
        type: 'pdf',
        category: 'infrastructure',
        status: 'approved',
        version: '2.1',
        file_size: 1024000,
        file_path: '/uploads/infrastructure_certificate_du.pdf',
        submitted_by: '550e8400-e29b-41d4-a716-446655440202',
        approved_by: '550e8400-e29b-41d4-a716-446655440201',
        submitted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        approved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expiry_date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
        tags: ['infrastructure', 'certificate', 'compliance'],
        is_active: true
      }
    ];
    
    for (const document of documents) {
      await Document.create(document);
    }
    
    logger.info(`Seeded ${documents.length} documents`);
  }

  // Clean database (remove all data)
  async clean() {
    try {
      logger.info('Cleaning database...');
      
      // Delete in reverse order of dependencies
      await Document.destroy({ where: {} });
      await Alert.destroy({ where: {} });
      await Faculty.destroy({ where: {} });
      await User.destroy({ where: {} });
      await Institution.destroy({ where: {} });
      
      logger.info('Database cleaned successfully');
      
    } catch (error) {
      logger.error('Database clean failed:', { error: error.message });
      throw error;
    }
  }

  // Reset database (clean + seed)
  async reset() {
    try {
      logger.info('Resetting database...');
      
      await this.clean();
      await this.seed();
      
      logger.info('Database reset completed successfully');
      
    } catch (error) {
      logger.error('Database reset failed:', { error: error.message });
      throw error;
    }
  }

  // Get seeding status
  async status() {
    try {
      const [institutionCount, userCount, facultyCount, alertCount, documentCount] = await Promise.all([
        Institution.count(),
        User.count(),
        Faculty.count(),
        Alert.count(),
        Document.count()
      ]);
      
      console.log('\n📊 Database Seeding Status:');
      console.log('='.repeat(50));
      console.log(`Institutions: ${institutionCount}`);
      console.log(`Users: ${userCount}`);
      console.log(`Faculty: ${facultyCount}`);
      console.log(`Alerts: ${alertCount}`);
      console.log(`Documents: ${documentCount}`);
      console.log('='.repeat(50));
      
      const totalRecords = institutionCount + userCount + facultyCount + alertCount + documentCount;
      console.log(`Total Records: ${totalRecords}`);
      
      if (totalRecords > 0) {
        console.log('✅ Database contains seeded data');
      } else {
        console.log('⏳ Database is empty (no seeded data)');
      }
      
    } catch (error) {
      logger.error('Failed to get seeding status:', { error: error.message });
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const force = args.includes('--force');
  
  const seeder = new DatabaseSeeder();
  
  try {
    switch (command) {
      case 'seed':
        if (force) {
          await seeder.seed();
        } else {
          await seeder.seed();
        }
        break;
        
      case 'clean':
        await seeder.clean();
        break;
        
      case 'reset':
        await seeder.reset();
        break;
        
      case 'status':
        await seeder.status();
        break;
        
      default:
        console.log(`
Usage: node scripts/seed.js [command] [--force]

Commands:
  seed              Seed database with initial data
  clean             Remove all seeded data
  reset             Clean and re-seed database
  status            Show seeding status

Options:
  --force           Override safety checks (use with caution)
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('Seeding script failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DatabaseSeeder;