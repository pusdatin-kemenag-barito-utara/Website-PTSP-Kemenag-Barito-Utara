import fs from "fs";

const url = "https://docs.google.com/spreadsheets/d/1NKXcD-NrOT7nPIrW_8mkQEZLzY3ZP3n2oRJCgvj4xCc/export?format=csv&gid=45141612";

async function run() {
  const res = await fetch(url);
  const text = await res.text();
  const rows = text.split("\n");
  for (let i = 0; i < 5; i++) {
    console.log(`Row ${i}:`);
    const cols = rows[i].split(",");
    cols.forEach((col, j) => {
      console.log(`  Col ${j}: ${col.trim()}`);
    });
  }
}

run();
