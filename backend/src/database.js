// backend/src/database.js

const sqlite3 = require('sqlite3').verbose();
// O banco de dados será um arquivo chamado 'chamados.db' na raiz
const DB_SOURCE = "chamados.db"; 

let db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        // Não consegue abrir o banco
        console.error(err.message);
        throw err;
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
        // 1. Cria a tabela CHAMADOS se ela não existir
        db.run(`CREATE TABLE IF NOT EXISTS CHAMADOS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT NOT NULL,
            status TEXT DEFAULT 'Aberto',
            prioridade TEXT DEFAULT 'Média',
            dataAbertura TEXT
        )`, (err) => {
            if (err) {
                // Tabela já criada ou erro
                console.log("Erro ao criar tabela:", err.message);
            } else {
                // 2. Tabela criada ou já existente. Agora, verifica se está vazia para inserir seed.
                db.get("SELECT COUNT(*) AS count FROM CHAMADOS", (err, row) => {
                    if (err) {
                        console.log("Erro ao verificar tabela:", err.message);
                    } else if (row.count === 0) {
                        // Tabela vazia, insere o dado inicial (seed)
                        console.log("Tabela CHAMADOS vazia. Inserindo dados iniciais (seed).");
                        const insert = 'INSERT INTO CHAMADOS (titulo, descricao, status, prioridade, dataAbertura) VALUES (?,?,?,?,?)';
                        
                        db.run(insert, ["Problema com Wi-Fi", "A conexão está caindo no escritório.", "Em Andamento", "Alta", new Date().toISOString()]);
                        db.run(insert, ["Solicitação de Office", "Preciso de uma licença.", "Aberto", "Média", new Date().toISOString()]);
                    } else {
                        console.log("Tabela CHAMADOS já contém dados. Inicialização concluída.");
                    }
                });
            }
        });  
    }
});

module.exports = db;