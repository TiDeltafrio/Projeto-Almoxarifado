let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];

let historico = [];

let pagina = "movimentacoes";

function abrirModal() {

document.getElementById("modal").style.display = "flex";

}

function fecharModal() {

document.getElementById("modal").style.display = "none";

}

function salvarMovimentacao(){

const dados = {

produto: document.getElementById("produto").value,

quantidade: Number(document.getElementById("quantidade").value),

movimentacao: document.getElementById("movimentacao").value,

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

function marcarAtivo(elemento){

const itens = document.querySelectorAll(".sidebar li");

itens.forEach(item => item.classList.remove("active"));

elemento.classList.add("active");

}

function mostrarMovimentacoes(){

pagina = "movimentacoes";

document.getElementById("tituloPagina").innerText = "Movimentações";

document.getElementById("btnPDF").style.display = "none";

document.getElementById("btnEnviar").style.display = "inline-block";

marcarAtivo(document.querySelector(".sidebar li:nth-child(1)"));

render();

}

async function mostrarHistorico(){

pagina = "historico";

document.getElementById("tituloPagina").innerText = "Histórico";

document.getElementById("btnPDF").style.display = "inline-block";

document.getElementById("btnEnviar").style.display = "none";

marcarAtivo(document.querySelector(".sidebar li:nth-child(2)"));

try{

const resposta = await fetch("/historico");

const dados = await resposta.json();

historico = dados;

render();

}catch(erro){

console.error(erro);

historico = [];

render();

}

}

function apagarMovimentacao(index){

movimentacoes.splice(index,1);

localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

render();

}

function render(){

const tabela = document.getElementById("tabela");

const thead = document.getElementById("thead");

tabela.innerHTML = "";

thead.innerHTML = `

<tr>

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

for(let mov of movimentacoes){

await fetch("/movimentacao",{

method:"POST",

headers:{ "Content-Type":"application/json" },

body: JSON.stringify(mov)

});

}

alert("Movimentações enviadas com sucesso!");

movimentacoes = [];

localStorage.removeItem("movimentacoes");

render();

}catch(erro){

console.error(erro);

alert("Erro ao enviar movimentações");

}

}

function baixarPDF(){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

doc.setFontSize(16);

doc.text("Histórico Almoxarifado",20,20);

let y = 30;

if(!historico || historico.length === 0){

doc.text("Nenhum dado disponível",20,y);

}else{

historico.forEach((item,index)=>{

const linha = `${index+1}. ${item.produto} | ${item.quantidade} | ${item.movimentacao} | ${item.origem} | ${item.destino} | ${item.observacoes}`;

doc.text(linha,20,y);

y+=10;

if(y>280){

doc.addPage();

y=20;

}

});

}

doc.save("historico.pdf");

}

mostrarMovimentacoes();