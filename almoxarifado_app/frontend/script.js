let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];

let historico = [];

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

function salvarMovimentacao(){

const produto_id = document.getElementById("produto_id").value;
const produto = document.getElementById("produto").value;
const quantidade = document.getElementById("quantidade").value;
const movimentacao = document.getElementById("movimentacao").value;

if(!produto_id || !produto || !quantidade || !movimentacao){
alert("Preencha todos os campos obrigatórios");
return;
}

const dados = {

produto_id: produto_id,
produto: produto,
quantidade: Number(quantidade),
movimentacao: movimentacao,
origem: document.getElementById("origem").value,
destino: document.getElementById("destino").value,
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

/* MOSTRA O BOTÃO */
document.getElementById("btnNova").style.display = "inline-block";

render();

}

async function mostrarHistorico(){

pagina = "historico";

document.getElementById("btnHist").classList.add("active");
document.getElementById("btnMov").classList.remove("active");

document.getElementById("tituloPagina").innerText = "Histórico";

document.getElementById("btnPDF").style.display = "inline-block";
document.getElementById("btnEnviar").style.display = "none";

/* ESCONDE O BOTÃO */
document.getElementById("btnNova").style.display = "none";

/* não busca API */
/* mostra apenas retorno do RPA */

render();

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

async function buscarOrigem(){

const id = document.getElementById("origem_id").value;

if(!id) return;

try{

const resposta = await fetch(`/almoxarifado/${id}`);

if(!resposta.ok){
document.getElementById("origem").value = "";
return;
}

const dados = await resposta.json();

document.getElementById("origem").value = dados.nome;

}catch(erro){

console.error(erro);

}

}

async function buscarDestino(){

const id = document.getElementById("destino_id").value;

if(!id) return;

try{

const resposta = await fetch(`/almoxarifado/${id}`);

if(!resposta.ok){
document.getElementById("destino").value = "";
return;
}

const dados = await resposta.json();

document.getElementById("destino").value = dados.nome;

}catch(erro){

console.error(erro);

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

async function buscarOrigem(){

const id = document.getElementById("origem_id").value;

if(!id) return;

try{

const resposta = await fetch(`/almoxarifado/${id}`);

if(!resposta.ok){
document.getElementById("origem").value = "";
return;
}

const dados = await resposta.json();

document.getElementById("origem").value = dados.nome;

}catch(erro){

console.error("Erro origem:", erro);

}

}

async function buscarDestino(){

const id = document.getElementById("destino_id").value;

if(!id) return;

try{

const resposta = await fetch(`/almoxarifado/${id}`);

if(!resposta.ok){
document.getElementById("destino").value = "";
return;
}

const dados = await resposta.json();

document.getElementById("destino").value = dados.nome;

}catch(erro){

console.error("Erro destino:", erro);

}

}

function baixarPDF(){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

/* título */

doc.setFontSize(16);
doc.text("Histórico de Movimentações", 14, 15);

/* colunas da tabela */

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

const linhas = historico.map(item => [

item.produto_id,
item.produto,
item.quantidade,
item.movimentacao,
item.origem,
item.destino,
item.observacoes,
item.data

]);

/* gera tabela */

doc.autoTable({

head: [colunas],
body: linhas,
startY: 25,
theme: "grid",
styles: { fontSize: 9 },
headStyles: { fillColor: [44,62,80] }

});

/* salva */

doc.save("historico_movimentacoes.pdf");

}