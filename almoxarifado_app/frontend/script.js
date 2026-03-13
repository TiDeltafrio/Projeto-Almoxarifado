let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];

let historico = [];
let historicoFiltrado = [];

let pagina = "movimentacoes";

function abrirModal(){

document.getElementById("produto_id").value = "";
document.getElementById("produto").value = "";
document.getElementById("quantidade").value = "";
document.getElementById("movimentacao").value = "";
document.getElementById("origem_id").value = "";
document.getElementById("origem").value = "";
document.getElementById("destino_id").value = "";
document.getElementById("destino").value = "";
document.getElementById("observacoes").value = "";

document.getElementById("modal").style.display = "flex";

}

function fecharModal(){
document.getElementById("modal").style.display = "none";
}

// Validar produto e almoxarifados antes de salvar
async function validarCampos() {
  const produtoId = document.getElementById("produto_id").value;
  const origemId = document.getElementById("origem_id").value;
  const destinoId = document.getElementById("destino_id").value;

  try {
    // Validar produto
    if (!produtoId) throw new Error("Produto inválido");
    let res = await fetch(`/produto/${produtoId}`);
    if (!res.ok) throw new Error("Produto não encontrado");
    const produto = await res.json();
    document.getElementById("produto").value = produto.descricao;

    // Validar origem
    if (!origemId) throw new Error("Almoxarifado de origem inválido");
    res = await fetch(`/almoxarifado/${origemId}`);
    if (!res.ok) throw new Error("Almoxarifado de origem não encontrado");
    const origem = await res.json();
    document.getElementById("origem").value = origem.nome;

    // Validar destino
    if (!destinoId) throw new Error("Almoxarifado de destino inválido");
    res = await fetch(`/almoxarifado/${destinoId}`);
    if (!res.ok) throw new Error("Almoxarifado de destino não encontrado");
    const destino = await res.json();
    document.getElementById("destino").value = destino.nome;

    return true; // Todos válidos
  } catch (erro) {
    alert(erro.message);
    return false; // Algum campo inválido
  }
}

// Função de salvar movimentação, agora async
function salvarMovimentacao() {
    const produto = document.getElementById("produto").value;
    const origem = document.getElementById("origem").value;
    const destino = document.getElementById("destino").value;
    const quantidade = document.getElementById("quantidade").value;
    const movimentacao = document.getElementById("movimentacao").value;

    if (!produto || !origem || !destino || !quantidade || !movimentacao) {
        alert("Preencha todos os campos obrigatórios corretamente. Verifique Produto, Origem e Destino.");
        return; // não deixa salvar
    }

    const dados = {
        produto_id: Number(document.getElementById("produto_id").value),
        produto: produto,
        quantidade: Number(quantidade),
        movimentacao: movimentacao,
        origem: origem,
        destino: destino,
        observacoes: document.getElementById("observacoes").value,
        data: new Date().toLocaleDateString("pt-BR")
    };

    movimentacoes.unshift(dados);
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

    fecharModal();
    render();
}

function apagarMovimentacao(index){

movimentacoes.splice(index,1);

localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

render();

}

function mostrarMovimentacoes(){

pagina = "movimentacoes";

document.getElementById("btnMov").classList.add("active");
document.getElementById("btnHist").classList.remove("active");

document.getElementById("tituloPagina").innerText = "Movimentações";

document.getElementById("btnPDF").style.display = "none";
document.getElementById("btnEnviar").style.display = "inline-block";
document.getElementById("btnNova").style.display = "inline-block";

/* esconder filtro */
document.getElementById("filtroDatas").style.display = "none";

render();

}

async function mostrarHistorico(){

pagina = "historico";

document.getElementById("btnHist").classList.add("active");
document.getElementById("btnMov").classList.remove("active");

document.getElementById("tituloPagina").innerText = "Histórico";

document.getElementById("btnPDF").style.display = "inline-block";
document.getElementById("btnEnviar").style.display = "none";
document.getElementById("btnNova").style.display = "none";

document.getElementById("filtroDatas").style.display = "flex";

try {

const resposta = await fetch("/historico");

if (!resposta.ok) {
console.warn("Erro ao buscar histórico");
historico = [];
render();
return;
}

historico = await resposta.json();

render();

} catch (erro) {

console.error("Erro ao carregar histórico:", erro);
historico = [];
render();

}

}

function render(){

const tabela = document.getElementById("tabela");
const thead = document.getElementById("thead");

tabela.innerHTML = "";

thead.innerHTML = `

<tr>

<th>ID</th>
<th>Produto</th>
<th>Quantidade</th>
<th>Movimentação</th>
<th>Origem</th>
<th>Destino</th>
<th>Observações</th>
<th>Data</th>
${pagina === "movimentacoes" ? "<th>Ações</th>" : ""}

</tr>

`;

const dados = pagina === "movimentacoes" ? movimentacoes : historico;

dados.forEach((item,index)=>{

tabela.innerHTML += `

<tr>

<td>${item.produto_id}</td>
<td>${item.produto}</td>
<td>${item.quantidade}</td>
<td>${item.movimentacao}</td>
<td>${item.origem}</td>
<td>${item.destino}</td>
<td>${item.observacoes}</td>
<td>${item.data || ""}</td>

${pagina === "movimentacoes" ? `<td><button onclick="apagarMovimentacao(${index})">Apagar</button></td>` : ""}

</tr>

`;

});

}

async function enviarParaAPI(){

if(movimentacoes.length === 0){
alert("Nenhuma movimentação para enviar");
return;
}

try{

const resposta = await fetch("/enviar-movimentacoes",{

method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify(movimentacoes)

});

const dados = await resposta.json();

/* retorno do RPA vira histórico */

historico = dados;

/* limpa movimentações locais */

movimentacoes = [];

localStorage.removeItem("movimentacoes");

render();

alert("Movimentações enviadas com sucesso!");

}catch(erro){

console.error(erro);
alert("Erro ao enviar movimentações");

}

}

mostrarMovimentacoes();

async function buscarProduto(){

const id = document.getElementById("produto_id").value;

if(!id) return;

try{

const resposta = await fetch(`/produto/${id}`);

if(!resposta.ok){
document.getElementById("produto").value = "";
alert("Produto não encontrado");
return;
}

const dados = await resposta.json();

document.getElementById("produto").value = dados.descricao;

}catch(erro){

console.error(erro);
alert("Erro ao buscar produto");

}

}

async function buscarOrigem() {
  const id = document.getElementById("origem_id").value;
  if (!id) return;

  try {
    const resposta = await fetch(`/almoxarifado/${id}`);
    if (!resposta.ok) {
      document.getElementById("origem").value = "";
      alert("Almoxarifado de origem não encontrado");
      return;
    }
    const dados = await resposta.json();
    document.getElementById("origem").value = dados.nome;
  } catch (erro) {
    document.getElementById("origem").value = "";
    alert("Erro ao buscar almoxarifado de origem");
  }
}

async function buscarDestino() {
  const id = document.getElementById("destino_id").value;
  if (!id) return;

  try {
    const resposta = await fetch(`/almoxarifado/${id}`);
    if (!resposta.ok) {
      document.getElementById("destino").value = "";
      alert("Almoxarifado de destino não encontrado");
      return;
    }
    const dados = await resposta.json();
    document.getElementById("destino").value = dados.nome;
  } catch (erro) {
    document.getElementById("destino").value = "";
    alert("Erro ao buscar almoxarifado de destino");
  }
}

async function buscarProduto(){

const id = document.getElementById("produto_id").value;

if(!id) return;

try{

const resposta = await fetch(`/produto/${id}`);

if(!resposta.ok){
document.getElementById("produto").value = "";
alert("Produto não encontrado");
return;
}

const dados = await resposta.json();

document.getElementById("produto").value = dados.descricao;

}catch(erro){

console.error("Erro ao buscar produto:", erro);

}

}

async function buscarOrigem() {
  const id = document.getElementById("origem_id").value;
  if (!id) return;

  try {
    const resposta = await fetch(`/almoxarifado/${id}`);
    if (!resposta.ok) {
      document.getElementById("origem").value = "";
      alert("Almoxarifado de origem não encontrado");
      return;
    }
    const dados = await resposta.json();
    document.getElementById("origem").value = dados.nome;
  } catch (erro) {
    document.getElementById("origem").value = "";
    alert("Erro ao buscar almoxarifado de origem");
  }
}

async function buscarDestino() {
  const id = document.getElementById("destino_id").value;
  if (!id) return;

  try {
    const resposta = await fetch(`/almoxarifado/${id}`);
    if (!resposta.ok) {
      document.getElementById("destino").value = "";
      alert("Almoxarifado de destino não encontrado");
      return;
    }
    const dados = await resposta.json();
    document.getElementById("destino").value = dados.nome;
  } catch (erro) {
    document.getElementById("destino").value = "";
    alert("Erro ao buscar almoxarifado de destino");
  }
}

function baixarPDF(){

const { jsPDF } = window.jspdf;

const dataInicio = document.getElementById("dataInicio").value;
const dataFim = document.getElementById("dataFim").value;

/* se não houver filtro ativo, limpa historicoFiltrado */

if(!dataInicio || !dataFim){
historicoFiltrado = [];
}

const doc = new jsPDF();

/* título */

doc.setFontSize(16);
doc.text("Histórico de Movimentações", 14, 15);

/* colunas */

const colunas = [
"ID",
"Produto",
"Quantidade",
"Movimentação",
"Origem",
"Destino",
"Observações",
"Data"
];

/* linhas */

const dadosPDF = historicoFiltrado.length > 0 ? historicoFiltrado : historico;

const linhas = dadosPDF.map(item => [
item.produto_id,
item.produto,
item.quantidade,
item.movimentacao,
item.origem,
item.destino,
item.observacoes,
item.data
]);

/* tabela */

doc.autoTable({
head: [colunas],
body: linhas,
startY: 25,
theme: "grid",
styles: { fontSize: 9 },
headStyles: { fillColor: [44,62,80] }
});

/* salvar */

doc.save("historico_movimentacoes.pdf");

}

function filtrarHistorico(){

const inicio = document.getElementById("dataInicio").value;
const fim = document.getElementById("dataFim").value;

if(!inicio || !fim){
alert("Selecione as duas datas");
return;
}

const inicioDate = new Date(inicio);
const fimDate = new Date(fim);

historicoFiltrado = historico.filter(item => {

const partes = item.data.split("/");
const dataItem = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);

return dataItem >= inicioDate && dataItem <= fimDate;

});

renderTabelaFiltrada(historicoFiltrado);

}

function limparFiltro(){

document.getElementById("dataInicio").value = "";
document.getElementById("dataFim").value = "";

historicoFiltrado = [];

renderTabela();

}

function renderTabelaFiltrada(lista){

const tabela = document.getElementById("tabela");

tabela.innerHTML = "";

lista.forEach(item => {

tabela.innerHTML += `

<tr>
<td>${item.produto_id}</td>
<td>${item.produto}</td>
<td>${item.quantidade}</td>
<td>${item.movimentacao}</td>
<td>${item.origem}</td>
<td>${item.destino}</td>
<td>${item.observacoes}</td>
<td>${item.data}</td>
</tr>

`;

});

}

function limparFiltro(){

document.getElementById("dataInicio").value = "";
document.getElementById("dataFim").value = "";

render();

}

