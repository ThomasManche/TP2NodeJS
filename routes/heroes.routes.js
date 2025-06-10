const express = require('express');
const {
  getHeroes,
  getHeroById,
  searchHeroByName,
  getSortedHeroes,
  addHero,
  deleteHero,
  exportHeroesCSV,
  getHeroesStats
} = require('../controllers/hero.controller');

const router = express.Router();

router.get('/', getHeroes);
router.get('/search', searchHeroByName);
router.get('/sorted', getSortedHeroes);
router.get('/export', exportHeroesCSV);    
router.get('/stats', getHeroesStats);        
router.get('/:id', getHeroById);
router.post('/', addHero);
router.delete('/:id', deleteHero);

module.exports = router;
