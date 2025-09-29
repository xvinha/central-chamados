// backend/src/index.js

const express = require('express');
const cors = require('cors'); // Para permitir a comunicação entre frontend e backend

const app = express();
const PORT = 3000;

// Middleware ESSENCIAL para ler o JSON enviado no corpo das requisições POST e PUT
app.use(express.json()); 
app.use(cors()); // Permite que o frontend acesse o backend

// 1. Defina aqui as rotas (APIs)
const chamadosRoutes = require('./routes/chamadosRoutes');
app.use('/api/chamados', chamadosRoutes);

// Servidor escutando a porta
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`API pronta em: http://localhost:${PORT}/api/chamados`);
});