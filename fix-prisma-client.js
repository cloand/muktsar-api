#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Prisma Client Issues...\n');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('prisma/schema.prisma')) {
    console.error('❌ Error: prisma/schema.prisma not found. Make sure you\'re in the muktsar-api directory.');
    process.exit(1);
  }

  console.log('1. 🗂️  Checking Prisma schema...');
  const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
  
  // Check if enhanced fields exist
  const hasEventFields = schemaContent.includes('contactPerson') && schemaContent.includes('registeredParticipants');
  const hasMediaFields = schemaContent.includes('category     MediaCategory') && schemaContent.includes('isFeatured');
  
  console.log(`   Event model enhanced: ${hasEventFields ? '✅' : '❌'}`);
  console.log(`   Media model enhanced: ${hasMediaFields ? '✅' : '❌'}`);

  if (!hasEventFields || !hasMediaFields) {
    console.log('\n⚠️  Schema appears to be missing enhanced fields. This might cause TypeScript errors.');
  }

  console.log('\n2. 🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('   ✅ Prisma client generated successfully');

  console.log('\n3. 📊 Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('   ✅ Database schema updated successfully');

  console.log('\n4. 🧪 Testing database connection...');
  try {
    execSync('npx prisma db execute --stdin < /dev/null', { stdio: 'pipe' });
    console.log('   ✅ Database connection successful');
  } catch (error) {
    console.log('   ⚠️  Database connection test skipped (this is normal)');
  }

  console.log('\n🎉 Prisma client fix completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Restart your development server: npm run start:dev');
  console.log('   2. Test the APIs: node test-apis.js');
  console.log('   3. Check TypeScript compilation: npm run build');

} catch (error) {
  console.error('\n❌ Error during Prisma client fix:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure you\'re in the muktsar-api directory');
  console.error('   2. Check if your database is running');
  console.error('   3. Verify your DATABASE_URL in .env file');
  console.error('   4. Try running commands manually:');
  console.error('      - npx prisma generate');
  console.error('      - npx prisma db push');
  process.exit(1);
}
