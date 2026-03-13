from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"


class Movimentacao(BaseModel):
    produto_id: int
    produto: str
    quantidade: int
    movimentacao: str
    origem: str
    destino: str
    observacoes: str
    data: str


def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Deltafrio@2026",
        database="almoxarifado"
    )


# ----------------------------
# BUSCAR PRODUTO
# ----------------------------
@app.get("/produto/{produto_id}")
def buscar_produto(produto_id: int):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT descricao FROM produtos WHERE id = %s", (produto_id,))
    resultado = cursor.fetchone()
    cursor.close()
    conn.close()

    if not resultado:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return {"descricao": resultado[0]}


# ----------------------------
# BUSCAR ALMOXARIFADO
# ----------------------------
@app.get("/almoxarifado/{id}")
def buscar_almoxarifado(id: int):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT nome FROM almoxarifados WHERE id=%s", (id,))
    resultado = cursor.fetchone()
    cursor.close()
    conn.close()

    if not resultado:
        raise HTTPException(status_code=404, detail="Almoxarifado não encontrado")

    return {"nome": resultado[0]}


# ----------------------------
# ADICIONAR MOVIMENTAÇÃO
# ----------------------------
@app.post("/movimentacao")
def adicionar_movimentacao(mov: Movimentacao):
    conn = conectar()
    cursor = conn.cursor()
    sql = """
    INSERT INTO movimentacoes
    (produto_id, produto, quantidade, movimentacao, origem, destino, observacoes, data)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """
    valores = (
        mov.produto_id,
        mov.produto,
        mov.quantidade,
        mov.movimentacao,
        mov.origem,
        mov.destino,
        mov.observacoes,
        mov.data
    )
    cursor.execute(sql, valores)
    conn.commit()
    cursor.close()
    conn.close()
    return {"mensagem": "Movimentação salva"}


# ----------------------------
# LISTAR MOVIMENTAÇÕES
# ----------------------------
@app.get("/movimentacoes")
def listar_movimentacoes():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT produto, quantidade, movimentacao, origem, destino, observacoes, data
    FROM movimentacoes
    ORDER BY id DESC
    """)
    resultado = cursor.fetchall()
    cursor.close()
    conn.close()

    dados = []
    for r in resultado:
        dados.append({
            "produto": r[0],
            "quantidade": r[1],
            "movimentacao": r[2],
            "origem": r[3],
            "destino": r[4],
            "observacoes": r[5],
            "data": r[6]
        })

    return dados


# ----------------------------
# ENVIAR PARA RPA (simulação)
# ----------------------------
@app.post("/enviar-movimentacoes")
def enviar_movimentacoes(movs: list):
    # Aqui você enviaria para o RPA
    # Exemplo fictício
    historico = []
    for m in movs:
        historico.append({
            "produto_id": m["produto_id"],
            "produto": m["produto"],
            "quantidade": m["quantidade"],
            "movimentacao": m["movimentacao"],
            "origem": m["origem"],
            "destino": m["destino"],
            "observacoes": m["observacoes"],
            "data": m["data"]
        })
    return historico


# ----------------------------
# FRONTEND
# ----------------------------
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")