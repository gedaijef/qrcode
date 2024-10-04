from flask import Flask, render_template, render_template_string, request, jsonify
from flask_cors import CORS
from db_config import get_db_connection

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    # Aqui você pode adicionar lógica para verificar se o usuário está logado
    login_status = request.cookies.get('login')
    
    if login_status == 'sim':
        return render_template('index.html')
    else:
        return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    user = data.get('user')
    password = data.get('password')
    
    try:
        conn = get_db_connection() #conexão com o banco de dados
        cur = conn.cursor()
        
        ## verificar se o aluno já marcou presença nessa data
        cur.execute("SELECT usuario, senha FROM login")

        row = cur.fetchone()
        print(row)
        if row:
            user_banco = row[0]
            password_banco = row[1]
        else:
            return jsonify({"status": "erro", "error": "Nenhum login encontrado"}), 404
        
        cur.close()
        conn.close()
    except Exception as e:
        print("Erro: " + str(e))
        return jsonify({"status": "erro", "error": str(e)}), 500

    # Verificação das credenciais
    valid_user = user == user_banco
    valid_password = password == password_banco

    if valid_user and valid_password:
        response = jsonify({"status": "ok"})
        response.set_cookie('login', 'sim')
        return response
    elif not valid_user and not valid_password:
        return jsonify({"status": "erro", "error": "invalid_user_and_password"}), 401
    elif not valid_user:
        return jsonify({"status": "erro", "error": "invalid_user"}), 401
    elif not valid_password:
        return jsonify({"status": "erro", "error": "invalid_password"}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    response = jsonify({"status": "logged_out"})
    response.set_cookie('login', 'não')
    return response

@app.route("/salvar", methods=["POST"])
def salvar():
    data = request.json
    nr_inscricao = data["nr_inscricao"]
    data_presenca = data["data_presenca"]
    hora = data["hora"]

    try:
        conn = get_db_connection() #conexão com o banco de dados
        cur = conn.cursor()
        
        ## verificar se o aluno já marcou presença nessa data
        cur.execute(
            "SELECT * FROM presenca WHERE nr_inscricao = %s AND data_presenca = %s",
            (nr_inscricao, data_presenca)
        )

        rows = cur.fetchall()
        print(rows)
        if len(rows) > 0:
            return jsonify({"status": "erro", "error": "Aluno ja marcou presença nessa data"}), 409
        
        cur.execute("INSERT INTO presenca (nr_inscricao, data_presenca, hora) VALUES (%s, %s, %s)", (nr_inscricao, data_presenca, hora))
        
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "ok"})
    except Exception as e:
        print("Erro: " + str(e))
        return jsonify({"status": "erro", "error": str(e)}), 500
    
        

if __name__ == '__main__':
    app.run(debug=True, port=5500, host="0.0.0.0")
