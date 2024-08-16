import os
import psycopg2

# Cria uma conexão com o banco de dados
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv("HOST"),
        database=os.getenv("DATABASE"),
        user=os.getenv("USER"),
        password=os.getenv("PASSWORD")
    )
    
    return conn