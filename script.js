const express = require('express');
const heroRoutes = require('./routes/heroes.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/heroes', heroRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API Node.js fonctionne avec SQLite !');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('SQLITE_ERROR')) {
    return res.status(422).json({ error: 'Requête SQL invalide', details: err.message });
  }
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
