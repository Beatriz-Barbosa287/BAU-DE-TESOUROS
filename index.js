const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuração da conexão com o banco MySQL
const dbConfig = {
  host: 'localhost',
  user: 'seu_usuario',
  password: 'sua_senha',
  database: 'banco_de_dados_cadastro'
};

// Rota para cadastro
app.post('/api/cadastro', async (req, res) => {
  const { tipo_usuario, nome, email, cpf_cnpj, senha } = req.body;

  if (!tipo_usuario || !nome || !email || !cpf_cnpj || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Conectar ao banco
    const connection = await mysql.createConnection(dbConfig);

    // Verificar se email já existe
    const [rows] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      await connection.end();
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }

    // Criptografar senha
    const hashSenha = await bcrypt.hash(senha, 10);

    // Inserir no banco
    await connection.execute(
      'INSERT INTO usuarios (tipo_usuario, nome, email, cpf_cnpj, senha) VALUES (?, ?, ?, ?, ?)',
      [tipo_usuario, nome, email, cpf_cnpj, hashSenha]
    );

    await connection.end();

    res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Servir a página HTML estática (opcional, caso queira servir pelo backend)
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
