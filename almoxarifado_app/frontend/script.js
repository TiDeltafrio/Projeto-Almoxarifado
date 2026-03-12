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

async function buscarProduto(){

const id = document.getElementById("produto_id").value;
if(!id) return;

try{

const resposta = await fetch(`/produto/${id}`);

if(!resposta.ok){
document.getElementById("produto").value="";
alert("Produto não encontrado");
return;
}

const dados = await resposta.json();
document.getElementById("produto").value = dados.descricao;

}catch(erro){
console.error(erro);
}

}

async function buscarOrigem(){

const id = document.getElementById("origem_id").value;
if(!id) return;

try{

const resposta = await fetch(`/almoxarifado/${id}`);

if(!resposta.ok){
document.getElementById("origem").value="";
alert("Origem não encontrada");
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
document.getElementById("destino").value="";
alert("Destino não encontrado");
return;
}

const dados = await resposta.json();
document.getElementById("destino").value = dados.nome;

}catch(erro){
console.error(erro);
}

}

function salvarMovimentacao(){

const dados = {

produto_id: document.getElementById("produto_id").value,
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

render();

}

async function mostrarHistorico(){

pagina = "historico";

document.getElementById("btnHist").classList.add("active");
document.getElementById("btnMov").classList.remove("active");

document.getElementById("tituloPagina").innerText = "Histórico";

document.getElementById("btnPDF").style.display = "inline-block";

document.getElementById("btnEnviar").style.display = "none";

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

mostrarMovimentacoes();