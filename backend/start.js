// start.js - Script para inicializar e testar o sistema completo

const fs = require('fs');
const path = require('path');

console.log('🚀 Inicializando Central de Chamados...\n');

// Verificar estrutura de arquivos
const arquivosEssenciais = [
    'backend/src/index.js',
    'backend/src/models/Chamado.js',
    'backend/src/controllers/chamadosController.js',
    'backend/src/routes/chamadosRoutes.js',
    'backend/src/database.js',
    'backend/package.json'
];

console.log('📁 Verificando estrutura de arquivos...');
let arquivosFaltando = [];

arquivosEssenciais.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
        console.log(`✅ ${arquivo}`);
    } else {
        console.log(`❌ ${arquivo} - FALTANDO`);
        arquivosFaltando.push(arquivo);
    }
});

if (arquivosFaltando.length > 0) {
    console.log(`\n❌ ${arquivosFaltando.length} arquivo(s) faltando. Corrija antes de continuar.`);
    process.exit(1);
}

// Verificar dependências
console.log('\n📦 Verificando dependências...');
const packageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
const dependenciasNecessarias = ['express', 'cors', 'sqlite3', 'body-parser'];

dependenciasNecessarias.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
    } else {
        console.log(`❌ ${dep} - FALTANDO`);
    }
});

console.log('\n🔧 Para instalar dependências execute: npm install\n');

// Inicializar servidor
console.log('🌐 Iniciando servidor backend...');
require('./backend/src/index.js');