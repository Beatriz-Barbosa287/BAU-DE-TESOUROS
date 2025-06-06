const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors()); // Permite requisições do navegador
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'baudetesouros',
};

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

// Rota para cadastro
app.post('/api/cadastrar', async (req, res) => {
  const { tipo_usuario, nome, email, cpf_cnpj, senha } = req.body;

  if (!tipo_usuario || !nome || !email || !cpf_cnpj || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Verifica se o e-mail já está cadastrado
    const [rows] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Insere no banco
    await connection.execute(
      'INSERT INTO usuarios (tipo_usuario, nome, email, cpf_cnpj, senha) VALUES (?, ?, ?, ?, ?)',
      [tipo_usuario, nome, email, cpf_cnpj, hashedPassword]
    );

    await connection.end();
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Rota para adicionar novo item de doação
app.post('/api/itensdoacao', upload.single('foto'), async (req, res) => {
  const { nome, telefone, cidade, uf } = req.body;
  const foto = req.file ? req.file.filename : null;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = 'INSERT INTO itensdoacao (nome, telefone, cidade, uf, foto) VALUES (?, ?, ?, ?, ?)';
    await connection.execute(sql, [nome, telefone, cidade, uf, foto]);
    await connection.end();
    res.status(201).json({ message: 'Item adicionado com sucesso!' });
  } catch (err) {
    console.error('Erro ao inserir item:', err);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// Rota para adicionar novo item de venda
app.post('/api/itensvenda', upload.single('foto'), async (req, res) => {
  const { nome, valor, telefone, cidade, uf } = req.body;
  const foto = req.file ? req.file.filename : null;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const sql = 'INSERT INTO itensvenda (nome, valor, telefone, cidade, uf, foto) VALUES (?, ?, ?, ?, ?, ?)';
    await connection.execute(sql, [nome, valor, telefone, cidade, uf, foto]);
    await connection.end();
    res.status(201).json({ message: 'Item de venda adicionado com sucesso!' });
  } catch (err) {
    console.error('Erro ao inserir item de venda:', err);
    res.status(500).json({ error: 'Erro ao adicionar item de venda' });
  }
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

// ROTA DE LOGIN
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
      [email, senha]
    );

    if (rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }

    await connection.end();
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
});


