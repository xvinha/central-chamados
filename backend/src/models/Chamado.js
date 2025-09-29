// backend/src/models/Chamado.js

// Importa o banco de dados que acabamos de configurar
const db = require('../database'); 

class Chamado {

    // READ ALL (GET /api/chamados)
    static listar() {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM CHAMADOS", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // READ ONE (GET /api/chamados/{id})
    static buscarPorId(id) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM CHAMADOS WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row); // Retorna o objeto (ou undefined se não existir)
                }
            });
        });
    }

    // CREATE (POST /api/chamados)
    static criar(novoChamado) {
        const sql = 'INSERT INTO CHAMADOS (titulo, descricao, status, prioridade, dataAbertura) VALUES (?,?,?,?,?)';
        const params = [
            novoChamado.titulo,
            novoChamado.descricao,
            novoChamado.status || 'Aberto', // Define 'Aberto' se não for passado
            novoChamado.prioridade || 'Média',
            new Date().toISOString()
        ];
        
        return new Promise((resolve, reject) => {
            // run executa o INSERT e o último argumento é o callback
            db.run(sql, params, function (err) { 
                if (err) {
                    reject(err);
                } else {
                    // Retorna o novo chamado com o ID gerado (this.lastID)
                    resolve({ id: this.lastID, ...novoChamado, status: params[2], dataAbertura: params[4] });
                }
            });
        });
    }

    // UPDATE (PUT /api/chamados/{id})
    static atualizar(id, dadosAtualizados) {
        // Assume que todos os campos podem ser atualizados, exceto o ID
        const sql = `UPDATE CHAMADOS SET 
                        titulo = COALESCE(?,titulo), 
                        descricao = COALESCE(?,descricao), 
                        status = COALESCE(?,status), 
                        prioridade = COALESCE(?,prioridade)
                    WHERE id = ?`;
        
        const params = [
            dadosAtualizados.titulo,
            dadosAtualizados.descricao,
            dadosAtualizados.status,
            dadosAtualizados.prioridade,
            id
        ];

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    // 0 changes significa que o ID não foi encontrado
                    resolve(null); 
                } else {
                    // Busca e retorna o registro atualizado
                    Chamado.buscarPorId(id).then(resolve).catch(reject);
                }
            });
        });
    }

    // DELETE (DELETE /api/chamados/{id})
    static excluir(id) {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM CHAMADOS WHERE id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    // Retorna true se algo foi deletado (this.changes > 0)
                    resolve(this.changes > 0); 
                }
            });
        });
    }
}

module.exports = Chamado;