/**
 * Script để cập nhật tất cả API calls từ hardcoded localhost sang createApiUrl
 * Chạy script này để tự động thay thế tất cả API calls
 */

const fs = require('fs');
const path = require('path');

// Danh sách các file cần cập nhật
const filesToUpdate = [
  'frontend/src/pages/admin/Dashboard.jsx',
  'frontend/src/pages/admin/Exams.jsx',
  'frontend/src/pages/admin/Reports.jsx',
  'frontend/src/pages/admin/Settings.jsx',
  'frontend/src/pages/admin/Users.jsx',
  'frontend/src/pages/teacher/CreateExam.jsx',
  'frontend/src/pages/teacher/Dashboard.jsx',
  'frontend/src/pages/teacher/ExamDetailResults.jsx',
  'frontend/src/pages/teacher/ExamResults.jsx',
  'frontend/src/pages/teacher/Exams.jsx',
  'frontend/src/pages/teacher/Monitor.jsx',
  'frontend/src/pages/teacher/Profile.jsx',
  'frontend/src/pages/teacher/Students.jsx',
  'frontend/src/pages/student/Dashboard.jsx',
  'frontend/src/pages/student/ExamDetailResult.jsx',
  'frontend/src/pages/student/ExamResult.jsx',
  'frontend/src/pages/student/Exams.jsx',
  'frontend/src/pages/student/Profile.jsx',
  'frontend/src/pages/student/StudentResults.jsx',
  'frontend/src/components/common/ChangePasswordForm.jsx',
  'frontend/src/components/common/ProfileForm.jsx',
  'frontend/src/components/teacher/ImportExcel.jsx'
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Thêm import createApiUrl nếu chưa có
    if (!content.includes('createApiUrl') && content.includes('http://localhost:5000')) {
      const importMatch = content.match(/import.*from.*['"]\.\.\/utils\/api['"];?/);
      if (importMatch) {
        // Đã có import từ api utils, thêm createApiUrl
        content = content.replace(
          /import.*from.*['"]\.\.\/utils\/api['"];?/,
          (match) => {
            if (match.includes('createApiUrl')) return match;
            return match.replace('}', ', createApiUrl }');
          }
        );
      } else {
        // Chưa có import, thêm mới
        const lastImport = content.lastIndexOf('import');
        const insertPos = content.indexOf('\n', lastImport) + 1;
        content = content.slice(0, insertPos) + 
                 "import { createApiUrl } from '../utils/api';\n" + 
                 content.slice(insertPos);
      }
      updated = true;
    }

    // Thay thế tất cả http://localhost:5000 bằng createApiUrl
    const localhostRegex = /['"]http:\/\/localhost:5000(\/[^'"]*)['"]/g;
    const newContent = content.replace(localhostRegex, (match, endpoint) => {
      return `createApiUrl('${endpoint}')`;
    });

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Chạy script
console.log('🚀 Starting API URL updates...\n');

let updatedCount = 0;
filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    if (updateFile(file)) {
      updatedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log(`\n✅ Completed! Updated ${updatedCount} files.`);
console.log('\n📝 Next steps:');
console.log('1. Review the changes');
console.log('2. Test the application locally');
console.log('3. Commit and push changes');
console.log('4. Redeploy to production'); 