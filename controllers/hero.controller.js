const db = require('../sqlite/database');

// GET /heroes
const getHeroes = (req, res) => {
  let query = 'SELECT * FROM heroes';
  let params = [];
  if (req.query.publisher) {
    query += ' WHERE publisher = ?';
    params.push(req.query.publisher);
  }
  const heroes = db.prepare(query).all(...params);
  res.json(heroes);
};

// GET /heroes/:id
const getHeroById = (req, res) => {
  const hero = db.prepare('SELECT * FROM heroes WHERE id = ?').get(req.params.id);
  if (!hero) return res.status(404).json({ error: 'Héros non trouvé' });
  res.json(hero);
};

// GET /heroes/search?q=...
const searchHeroByName = (req, res) => {
  if (!req.query.q) return res.status(400).json({ error: 'Le nom est requis' });
  const heroes = db.prepare('SELECT * FROM heroes WHERE name LIKE ?').all(`%${req.query.q}%`);
  res.json(heroes);
};

// GET /heroes/sorted?by=height_cm,weight_kg
const getSortedHeroes = (req, res) => {
  const valid = ['height_cm', 'weight_kg', 'name', 'publisher'];
  let sortFields = [];
  if (req.query.by) {
    sortFields = req.query.by.split(',').map(f => f.trim()).filter(f => valid.includes(f));
  }
  if (sortFields.length === 0) sortFields = ['id'];
  const orderBy = sortFields.join(', ');
  const heroes = db.prepare(`SELECT * FROM heroes ORDER BY ${orderBy}`).all();
  res.json(heroes);
};

// POST /heroes
const addHero = (req, res) => {
  const { name, publisher } = req.body;
  if (!name || !publisher) return res.status(400).json({ error: 'Nom et éditeur requis' });
  const now = new Date().toISOString();
  const result = db.prepare(
    'INSERT INTO heroes (name, publisher, createdAt) VALUES (?, ?, ?)'
  ).run(name, publisher, now);
  res.status(201).json({ id: result.lastInsertRowid });
};

// DELETE /heroes/:id
const deleteHero = (req, res) => {
  const result = db.prepare('DELETE FROM heroes WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Héros non trouvé' });
  res.status(204).send();
};

// BONUS 1 : Export CSV /heroes/export?publisher=DC
const exportHeroesCSV = (req, res) => {
  let query = 'SELECT * FROM heroes';
  let params = [];
  if (req.query.publisher) {
    query += ' WHERE publisher = ?';
    params.push(req.query.publisher);
  }
  const heroes = db.prepare(query).all(...params);

  if (!heroes.length) return res.status(404).json({ error: 'Aucun héros trouvé' });

  const header = Object.keys(heroes[0]).join(';');
  const rows = heroes.map(hero => Object.values(hero).join(';'));
  const csv = [header, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="heroes.csv"');
  res.send(csv);
};

// BONUS 2 : Statistiques /heroes/stats
const getHeroesStats = (req, res) => {
  const global = db.prepare(`
    SELECT 
      COUNT(*) AS total,
      AVG(height_cm) AS avg_height,
      AVG(weight_kg) AS avg_weight
    FROM heroes
  `).get();

  const byPublisher = db.prepare(`
    SELECT 
      publisher,
      COUNT(*) AS total,
      AVG(height_cm) AS avg_height,
      AVG(weight_kg) AS avg_weight
    FROM heroes
    GROUP BY publisher
  `).all();

  res.json({
    global,
    byPublisher
  });
};

module.exports = {
  getHeroes,
  getHeroById,
  searchHeroByName,
  getSortedHeroes,
  addHero,
  deleteHero,
  exportHeroesCSV,
  getHeroesStats
};
