import psycopg2

# Cria uma conexão com o banco de dados
def get_db_connection():
    conn = psycopg2.connect(
        host="dpg-cpqrj6dumphs73b19nag-a.oregon-postgres.render.com",
        database="dbpresencatech2025",
        user="dbpresencatech2025_user",
        password="3xFezRq99dDulmawROUuP5cWTowtAx5K",
        port="5432"
    )
    
    return conn