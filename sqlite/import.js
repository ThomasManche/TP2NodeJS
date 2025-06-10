const db = require('./database');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./SuperHerosComplet.json', 'utf-8'));
const insert = db.prepare(`INSERT INTO heroes (name, publisher, gender, race, power, alignment, height_cm, weight_kg, createdAt)
VALUES (@name, @publisher, @gender, @race, @power, @alignment, @height_cm, @weight_kg, @createdAt)`);

const count = db.prepare('SELECT COUNT(*) as total FROM heroes').get();
if (count.total === 0) {
  const now = new Date().toISOString();
  for (const hero of data.superheros) { // <-- correction ici
    insert.run({
      name: hero.name,
      publisher: hero.biography.publisher,
      gender: hero.appearance.gender,
      race: hero.appearance.race,
      power: hero.powerstats ? hero.powerstats.power : null,
      alignment: hero.biography.alignment,
      height_cm: hero.appearance.height[1] ? parseInt(hero.appearance.height[1]) : null,
      weight_kg: hero.appearance.weight[1] ? parseInt(hero.appearance.weight[1]) : null,
      createdAt: now
    });
  }
  console.log('Données initiales importées.');
}
