// backend/src/controllers/chamadosController.js

const Chamado = require('../models/Chamado');

// READ ALL (Assíncrono)
exports.listarChamados = async (req, res) => {
    try {
        const lista = await Chamado.listar();
        res.json(lista);
    } catch (error) {
        console.error("Erro ao listar chamados:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor ao buscar dados." });
    }
};

// READ ONE (Assíncrono)
exports.buscarChamado = async (req, res) => {
    try {
        const id = req.params.id;
        const chamado = await Chamado.buscarPorId(id);

        if (chamado) {
            res.json(chamado);
        } else {
            res.status(404).json({ mensagem: "Chamado não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao buscar chamado:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

// CREATE (Assíncrono)
exports.criarChamado = async (req, res) => {
    try {
        const novoChamado = req.body;
        // Validação básica
        if (!novoChamado.titulo || !novoChamado.descricao) {
            return res.status(400).json({ mensagem: "Título e descrição são obrigatórios." });
        }

        const chamadoCriado = await Chamado.criar(novoChamado);
        res.status(201).json(chamadoCriado);
    } catch (error) {
        console.error("Erro ao criar chamado:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor ao criar o chamado." });
    }
};

// UPDATE (Assíncrono)
exports.atualizarChamado = async (req, res) => {
    try {
        const id = req.params.id;
        const dadosAtualizados = req.body;

        if (Object.keys(dadosAtualizados).length === 0) {
            return res.status(400).json({ mensagem: "Corpo da requisição vazio." });
        }

        const chamadoAtualizado = await Chamado.atualizar(id, dadosAtualizados);

        if (chamadoAtualizado) {
            res.json(chamadoAtualizado);
        } else {
            res.status(404).json({ mensagem: "Chamado não encontrado para atualização." });
        }
    } catch (error) {
        console.error("Erro ao atualizar chamado:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

// DELETE (Assíncrono)
exports.excluirChamado = async (req, res) => {
    try {
        const id = req.params.id;
        const sucesso = await Chamado.excluir(id);

        if (sucesso) {
            res.status(204).send(); 
        } else {
            res.status(404).json({ mensagem: "Chamado não encontrado para exclusão." });
        }
    } catch (error) {
        console.error("Erro ao excluir chamado:", error);
        res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};