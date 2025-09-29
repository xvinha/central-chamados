# Central de Chamados - Backend API

## 📝 Descrição do Projeto

Este é o componente de backend de uma aplicação de Gerenciamento de Chamados (Suporte/Tickets). O sistema expõe uma API RESTful completa para realizar operações CRUD (Criar, Ler, Atualizar, Excluir) em entidades de "Chamado".

O projeto foi construído utilizando Node.js e o framework Express, com persistência de dados em um banco de dados SQLite leve e fácil de configurar.

## ✨ Funcionalidades Principais

A API suporta as seguintes operações para a entidade `Chamado`:

* **Listagem de Chamados:** Retorna todos os chamados abertos e fechados.
* **Busca por ID:** Retorna detalhes de um chamado específico.
* **Criação de Novo Chamado:** Permite registrar um novo chamado (com validação de `titulo` e `descricao`).
* **Atualização de Chamado:** Permite modificar o status, prioridade, ou o conteúdo de um chamado existente.
* **Exclusão de Chamado:** Remove um chamado permanentemente.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza a seguinte stack de tecnologias:

* **Node.js**
* **Express.js:** Framework web para roteamento.
* **SQLite3:** Banco de dados relacional leve e sem servidor.
* **CORS:** Middleware para permitir requisições de origens diferentes (necessário para o frontend).

## 🚀 Instalação e Execução

### Pré-requisitos

Certifique-se de ter o Node.js e o npm (ou Yarn) instalados na sua máquina.

### Passos de Configuração

1.  **Navegue até a pasta do projeto e instale as dependências:**
    ```bash
    cd backend
    npm install
    ```

2.  **Inicialize o Servidor:**
    O servidor será iniciado na porta **3000**.
    ```bash
    node src/index.js
    ```
    *Se desejar rodar em modo de desenvolvimento (com reinício automático em alterações), é recomendável usar o `nodemon` e configurar um script `dev` no `package.json`.*

O console indicará que a API está pronta em: `http://localhost:3000/api/chamados`.

## 🗄️ Banco de Dados

O banco de dados é um arquivo SQLite chamado `chamados.db`. Ele é criado automaticamente na inicialização, e a tabela `CHAMADOS` é populada com dados iniciais (seeding) se for a primeira vez que o sistema é executado.

**Estrutura da Tabela `CHAMADOS`:**

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `INTEGER` | Chave primária, auto-incrementável |
| `titulo` | `TEXT` | Título do chamado (Obrigatório) |
| `descricao` | `TEXT` | Detalhes do problema/solicitação (Obrigatório) |
| `status` | `TEXT` | Estado atual ('Aberto', 'Em Andamento', 'Fechado'). Padrão: 'Aberto' |
| `prioridade` | `TEXT` | Nível de urgência ('Baixa', 'Média', 'Alta'). Padrão: 'Média' |
| `dataAbertura` | `TEXT` | Timestamp de criação no formato ISO (automático) |

---

## 🧭 Documentação da API (Endpoints)

Todos os endpoints utilizam a URL base: `http://localhost:3000/api/chamados`.

| Método | Endpoint | Descrição | Corpo da Requisição (Body) | Resposta de Sucesso |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | Lista todos os chamados. | *Nenhum* | `HTTP 200` + Array de chamados |
| **GET** | `/:id` | Busca um chamado pelo ID. | *Nenhum* | `HTTP 200` + Objeto Chamado (ou `404` se não encontrado) |
| **POST** | `/` | Cria um novo chamado. | `{ "titulo": "...", "descricao": "...", "status": "...", "prioridade": "..." }` | `HTTP 201 Created` + Objeto Chamado com ID |
| **PUT** | `/:id` | Atualiza (parcial ou totalmente) um chamado existente. | `{ "status": "Em Andamento" }` | `HTTP 200 OK` + Objeto Chamado atualizado |
| **DELETE** | `/:id` | Exclui um chamado pelo ID. | *Nenhum* | `HTTP 204 No Content` |
