document.addEventListener("DOMContentLoaded", function () {
  const rotasCategorias = {
    'brinquedos': 'brinquedos.html',
    'roupas': 'roupas.html',
    'bonecas': 'bonecas.html',
    'bonecos': 'bonecos.html',
    'fantasias': 'fantasias.html'
  };

  document.getElementById("buscar").addEventListener("click", function () {
    const termo = document.getElementById("pesquisa").value.toLowerCase().trim();
    if (rotasCategorias[termo]) {
      window.location.href = rotasCategorias[termo];
    } else {
      alert("Categoria não encontrada. Tente: brinquedos, roupas, bonecas...");
    }
  });

  document.getElementById("icone-busca").addEventListener("click", function () {
    const termo = document.getElementById("pesquisa").value.toLowerCase().trim();
    if (rotasCategorias[termo]) {
      window.location.href = rotasCategorias[termo];
    } else {
      alert("Categoria não encontrada. Tente: brinquedos, roupas, bonecas...");
    }
  });
});


//SALVAR CADASTRO BANCO DE DADOS

async function handleCadastro(event) {
    event.preventDefault();

    const tipo_usuario = document.getElementById('tipo_usuario').value;
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const cpf_cnpj = document.getElementById('cpf_cnpj').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tipo_usuario, nome, email, cpf_cnpj, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'login.html';
        } else {
            alert(`Erro: ${dados.message}`);
        }
    } catch (erro) {
        console.error('Erro ao cadastrar:', erro);
        alert('Erro ao conectar com o servidor.');
    }
}
