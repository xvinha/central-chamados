const express = require('express');
const router = express.Router();
const chamadosController = require('../controllers/chamadosController');

// CREATE e READ All
router.get('/', chamadosController.listarChamados); // GET /api/chamados
router.post('/', chamadosController.criarChamado); // POST /api/chamados

// READ One, UPDATE e DELETE
router.get('/:id', chamadosController.buscarChamado);   // GET /api/chamados/1
router.put('/:id', chamadosController.atualizarChamado); // PUT /api/chamados/1
router.delete('/:id', chamadosController.excluirChamado); // DELETE /api/chamados/1

module.exports = router;