/**
 * Global teardown for Playwright tests
 * Runs after all tests
 */
const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up old test artifacts (optional)
  const reportsDir = path.join(__dirname, '../reports');
  const screenshotsDir = path.join(reportsDir, 'screenshots');
  const videosDir = path.join(reportsDir, 'videos');
  
  // Keep only last 10 screenshots and videos
  try {
    if (fs.existsSync(screenshotsDir)) {
      const screenshots = fs.readdirSync(screenshotsDir)
        .filter(file => file.endsWith('.png'))
        .map(file => ({
          name: file,
          time: fs.statSync(path.join(screenshotsDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);
      
      // Remove old screenshots (keep last 10)
      screenshots.slice(10).forEach(file => {
        fs.unlinkSync(path.join(screenshotsDir, file.name));
      });
    }
    
    if (fs.existsSync(videosDir)) {
      const videos = fs.readdirSync(videosDir)
        .filter(file => file.endsWith('.webm'))
        .map(file => ({
          name: file,
          time: fs.statSync(path.join(videosDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);
      
      // Remove old videos (keep last 5)
      videos.slice(5).forEach(file => {
        fs.unlinkSync(path.join(videosDir, file.name));
      });
    }
  } catch (error) {
    console.log('⚠️ Cleanup failed:', error.message);
  }
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;

