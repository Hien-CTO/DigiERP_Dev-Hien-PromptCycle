/**
 * Global setup for Playwright tests
 * Runs before all tests
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function globalSetup(config) {
  console.log('🚀 Starting global setup...');
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const screenshotsDir = path.join(reportsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  const videosDir = path.join(reportsDir, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  
  // Check if application is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Checking if application is running...');
    await page.goto('http://localhost:3000', { timeout: 10000 });
    console.log('✅ Application is running');
    
    // Check if API Gateway is accessible
    try {
      const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:4000';
      const response = await page.request.get(`${apiGatewayUrl}/health`);
      if (response.ok()) {
        console.log('✅ API Gateway is accessible');
      } else {
        console.log('⚠️ API Gateway returned status:', response.status());
      }
    } catch (error) {
      console.log('⚠️ API Gateway check failed:', error.message);
      console.log('Please ensure API Gateway is running on port 4000');
    }
    
  } catch (error) {
    console.log('❌ Application is not running:', error.message);
    console.log('Please start the application before running tests');
    process.exit(1);
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed');
}

module.exports = globalSetup;

