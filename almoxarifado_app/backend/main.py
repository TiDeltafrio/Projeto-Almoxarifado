from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# =========================
# Configuração FastAPI
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Caminho do frontend
# =========================
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

# =========================
# Modelo de Movimentação
# =========================
class Movimentacao(BaseModel):
    produto: str
    quantidade: int
    movimentacao: str
    origem: str
    destino: str
    observacoes: str
    data: str


# =========================
# Criar banco de dados
# =========================
def criar_banco():
    conn = sqlite3.connect("almoxarifado.db")
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS movimentacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produto TEXT,
            quantidade INTEGER,
            movimentacao TEXT,
            origem TEXT,
            destino TEXT,
            observacoes TEXT,
            data TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS historico (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produto TEXT,
            quantidade INTEGER,
            movimentacao TEXT,
            origem TEXT,
            destino TEXT,
            observacoes TEXT,
            data TEXT
        )
    ''')

    conn.commit()
    conn.close()

criar_banco()

# =========================
# POST /movimentacao
# =========================
@app.post("/movimentacoes")
def adicionar_movimentacao(mov: Movimentacao):

    try:
        conn = sqlite3.connect("almoxarifado.db")
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO movimentacoes
            (produto, quantidade, movimentacao, origem, destino, observacoes, data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            mov.produto,
            mov.quantidade,
            mov.movimentacao,
            mov.origem,
            mov.destino,
            mov.observacoes,
            mov.data
        ))

        conn.commit()
        conn.close()

        return {"mensagem": "Movimentação salva com sucesso"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# GET /movimentacoes
# =========================
@app.get("/movimentacoes")
def obter_movimentacoes():

    try:
        conn = sqlite3.connect("almoxarifado.db")
        cursor = conn.cursor()

        cursor.execute('''
            SELECT produto, quantidade, movimentacao, origem, destino, observacoes, data
            FROM movimentacoes
            ORDER BY id DESC
            LIMIT 50
        ''')

        resultado = cursor.fetchall()
        conn.close()

        movimentacoes = []

        for row in resultado:
            movimentacoes.append({
                "produto": row[0],
                "quantidade": row[1],
                "movimentacao": row[2],
                "origem": row[3],
                "destino": row[4],
                "observacoes": row[5],
                "data": row[6]
            })

        return movimentacoes

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# GET /historico
# =========================
@app.get("/historico")
def obter_historico():

    try:
        conn = sqlite3.connect("almoxarifado.db")
        cursor = conn.cursor()

        cursor.execute('''
            SELECT produto, quantidade, movimentacao, origem, destino, observacoes, data
            FROM historico
            ORDER BY id DESC
            LIMIT 500
        ''')

        resultado = cursor.fetchall()
        conn.close()

        historico = []

        for row in resultado:
            historico.append({
                "produto": row[0],
                "quantidade": row[1],
                "movimentacao": row[2],
                "origem": row[3],
                "destino": row[4],
                "observacoes": row[5],
                "data": row[6]
            })

        return historico

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# SERVIR FRONTEND
# =========================
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")