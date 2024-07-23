const path = require('path');
require('dotenv').config({
    override: true,
    path: path.resolve(__dirname, '.env')
});
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
    ssl: {
        rejectUnauthorized: false // Esta opção permite conexões a servidores com certificados autoassinados
    }
});

const express = require('express');
const app = express();

app.set('view engine', 'ejs');

// Iniciar o servidor
app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});

app.get('/', async (req, res) => {
    const client = await pool.connect();

    try {
        const info = await client.query(`SELECT t.turma, COALESCE(p.presentes, 0) AS "presentes", COALESCE(a.ausentes, 0) AS "ausentes", t.total FROM (SELECT c.turma, COUNT(c.turma) AS "total" FROM candidatos c GROUP BY c.turma) t LEFT JOIN   (SELECT c.turma, COUNT(c.turma) AS "presentes" FROM         candidatos c JOIN presenca p ON c.nr_inscricao = p.nr_inscricao WHERE p.data_presenca = current_date GROUP BY c.turma ) p ON t.turma = p.turma LEFT JOIN (SELECT c.turma,  COUNT(c.turma) AS "ausentes" FROM candidatos c WHERE c.nome NOT IN (SELECT c.nome FROM presenca p RIGHT JOIN candidatos c ON c.nr_inscricao = p.nr_inscricao WHERE p.data_presenca = current_date) GROUP BY c.turma) a ON t.turma = a.turma;`);

        res.render('index', { info: info.rows });
        client.release();
    } catch (err) {
        res.send("Erro ao obter dados: " + err);
    }
})



app.get('/presentes', async (req, res) => {
    const client = await pool.connect();

    try {
        const presentes = await client.query(`select nome, c.nr_inscricao, turma, periodo, sala, professor 
                                                from candidatos c join presenca p 
                                                on c.nr_inscricao = p.nr_inscricao 
                                                where data_presenca = current_date 
                                                order by turma, nome asc`);

        res.render('candidatos_presentes.ejs', { presentes: presentes.rows });
        client.release();
    } catch (err) {
        res.send("Erro ao obter dados: " + err);
    }
})

app.get('/ausentes', async (req, res) => {
    const client = await pool.connect();

    try {
        const ausentes = await client.query(`SELECT c.nome, c.nr_inscricao, c.turma, c.periodo, c.sala, c.professor 
                                            FROM candidatos c LEFT JOIN presenca p
                                            ON c.nr_inscricao = p.nr_inscricao 
                                            AND p.data_presenca = CURRENT_DATE
                                            WHERE p.nr_inscricao IS NULL
                                            order by turma, nome asc
        `);

        res.render('candidatos_ausentes.ejs', { ausentes: ausentes.rows });
        
        client.release();
    } catch (err) {
        res.send("Erro ao obter dados: " + err);
    }
})