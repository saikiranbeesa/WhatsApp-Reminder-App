const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Forces Puppeteer to physically download Chrome INSIDE the project directory
  // so Render doesn't maliciously wipe the OS cache between the Build and Start phases!
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
