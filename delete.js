const fs = require('fs');
const path = require('path');

const targets = [
  'e:\\CODING\\project-kantor\\ptsp-kemenag\\app\\admin\\persuratan',
  'e:\\CODING\\project-kantor\\ptsp-kemenag\\components\\admin\\persuratan',
  'e:\\CODING\\project-kantor\\ptsp-kemenag\\lib\\actions\\admin\\admin-persuratan.ts'
];

targets.forEach(t => {
  try {
    fs.rmSync(t, { recursive: true, force: true });
    console.log(`Deleted ${t}`);
  } catch (e) {
    console.error(`Failed to delete ${t}:`, e.message);
  }
});
