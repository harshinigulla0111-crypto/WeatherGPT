import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const images = [
  { name: 'sunset_golden.jpg', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80' },
  { name: 'dawn_sunrise.jpg', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80' },
  { name: 'clear_day.jpg', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { name: 'cloudy_day.jpg', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80' },
  { name: 'rainy_day.jpg', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80' },
  { name: 'thunderstorm.jpg', url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=1200&q=80' },
  { name: 'starry_night.jpg', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80' },
  { name: 'foggy_mist.jpg', url: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1200&q=80' },
  { name: 'risk_storm.jpg', url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&q=80' },
  { name: 'rescue_emergency.jpg', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80' }
];

const targetDir = path.resolve('public', 'weather-scenes');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

for (const img of images) {
  const dest = path.join(targetDir, img.name);
  console.log(`Downloading ${img.name}...`);
  try {
    execSync(`curl.exe -L -s -o "${dest}" "${img.url}"`);
    const stat = fs.statSync(dest);
    console.log(`Saved ${img.name} (${stat.size} bytes)`);
  } catch (err) {
    console.error(`Error downloading ${img.name}:`, err.message);
  }
}
console.log('Done downloading all scenes!');
