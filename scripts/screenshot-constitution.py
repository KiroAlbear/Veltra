#!/usr/bin/env python3
"""Screenshot the Constitution page for review."""
import subprocess
import sys
import os

url = "http://localhost:3000/constitution"
output_dir = "/home/z/my-project/download"

# Use playwright to take a full-page screenshot
script = """
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Dark mode screenshot
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('%s', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Full page screenshot
  await page.screenshot({ path: '%s/constitution-full-dark.png', fullPage: true });

  // Above the fold
  await page.screenshot({ path: '%s/constitution-hero-dark.png', fullPage: false });

  // Scroll to middle section and screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.3));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '%s/constitution-middle-dark.png', fullPage: false });

  // Scroll to Three Laws section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '%s/constitution-laws-dark.png', fullPage: false });

  // Light mode screenshot
  await page.emulateMedia({ colorScheme: 'light' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '%s/constitution-hero-light.png', fullPage: false });

  // Landing page screenshot (dark)
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '%s/landing-hero-dark.png', fullPage: false });

  // Scroll to Today's Brief preview
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '%s/landing-brief-dark.png', fullPage: false });

  // Scroll to Pricing
  await page.evaluate(() => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '%s/landing-pricing-dark.png', fullPage: false });

  // Scroll to Solutions
  await page.evaluate(() => {
    const el = document.getElementById('solutions');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '%s/landing-solutions-dark.png', fullPage: false });

  await browser.close();
  console.log('Screenshots saved!');
})();
""" % (url, output_dir, output_dir, output_dir, output_dir, output_dir, output_dir, output_dir, output_dir)

# Write the script
with open('/tmp/screenshot.js', 'w') as f:
    f.write(script)

# Run it
result = subprocess.run(['node', '/tmp/screenshot.js'], capture_output=True, text=True, timeout=60)
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr[:500])
