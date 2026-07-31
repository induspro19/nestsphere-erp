const fs = require('fs');
const path = require('path');

const residentPagesDir = 'C:\\Users\\Dell\\.gemini\\antigravity\\scratch\\society-erp\\frontend\\src\\pages\\resident';
const residentLayoutDir = 'C:\\Users\\Dell\\.gemini\\antigravity\\scratch\\society-erp\\frontend\\src\\components\\layout\\resident';

const filesToAudit = [
  ...fs.readdirSync(residentPagesDir).map(f => path.join(residentPagesDir, f)),
  ...fs.readdirSync(residentLayoutDir).map(f => path.join(residentLayoutDir, f))
];

console.log(`Auditing ${filesToAudit.length} files in Resident Module...\n`);

let totalButtons = 0;
let deadButtons = 0;
const report = [];

filesToAudit.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const relPath = path.relative('C:\\Users\\Dell\\.gemini\\antigravity\\scratch\\society-erp', file);
  
  // Find all <button> and <Button> tags
  const buttonMatches = content.match(/<(button|Button)[^>]*>/g) || [];
  totalButtons += buttonMatches.length;

  // Find any onClick={() => {}} or empty click handlers
  const emptyClicks = content.match(/onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/g) || [];
  const hrefHashes = content.match(/href="#"/g) || [];

  if (emptyClicks.length > 0 || hrefHashes.length > 0) {
    deadButtons += emptyClicks.length + hrefHashes.length;
    report.push({
      file: relPath,
      totalButtons: buttonMatches.length,
      emptyClicks: emptyClicks.length,
      hrefHashes: hrefHashes.length,
    });
  } else {
    report.push({
      file: relPath,
      totalButtons: buttonMatches.length,
      emptyClicks: 0,
      hrefHashes: 0,
      status: 'CLEAN'
    });
  }
});

console.log(`Total Buttons Checked: ${totalButtons}`);
console.log(`Dead / Empty Handlers Found: ${deadButtons}`);
console.table(report);
