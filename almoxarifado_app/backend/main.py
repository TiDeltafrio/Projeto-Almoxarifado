from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# caminho frontend
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

# modelo
class Movimentacao(BaseModel):
    produto: str
    quantidade: int
    movimentacao: str
    origem: str
    destino: str
    observacoes: str
    data: str


# conexão com mysql
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Deltafrio@2026",
        database="almoxarifado"
    )


# criar tabelas automaticamente
def criar_tabelas():

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS movimentacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        produto VARCHAR(255),
        quantidade INT,
        movimentacao VARCHAR(50),
        origem VARCHAR(255),
        destino VARCHAR(255),
        observacoes TEXT,
        data VARCHAR(50)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS historico (
        id INT AUTO_INCREMENT PRIMARY KEY,
        produto VARCHAR(255),
        quantidade INT,
        movimentacao VARCHAR(50),
        origem VARCHAR(255),
        destino VARCHAR(255),
        observacoes TEXT,
        data VARCHAR(50)
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()


criar_tabelas()


# salvar movimentação
@app.post("/movimentacao")
def adicionar_movimentacao(mov: Movimentacao):

    try:

        conn = conectar()
        cursor = conn.cursor()

        sql = """
        INSERT INTO movimentacoes
        (produto, quantidade, movimentacao, origem, destino, observacoes, data)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """

        valores = (
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

    except Exception as e:
        print("ERRO MYSQL:", e)
        raise HTTPException(status_code=500, detail=str(e))


# listar movimentacoes
@app.get("/movimentacoes")
def listar_movimentacoes():

    try:

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

    except Exception as e:
        print("ERRO MYSQL:", e)
        raise HTTPException(status_code=500, detail=str(e))


# historico
@app.get("/historico")
def listar_historico():

    try:

        conn = conectar()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT produto, quantidade, movimentacao, origem, destino, observacoes, data
        FROM historico
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

    except Exception as e:
        print("ERRO MYSQL:", e)
        raise HTTPException(status_code=500, detail=str(e))


# servir frontend
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")