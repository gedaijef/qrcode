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
        const info = await client.query(`
       SELECT t.turma,
	   COALESCE(p.presentes, 0) AS "presentes",
	   COALESCE(a.ausentes, 0) AS "ausentes",
	   t.total
	   FROM (SELECT c.turma,
	  				COUNT(c.turma) AS "total" 
	  		 FROM candidatos c 
	  		 where POSITION((SELECT 
							  CASE EXTRACT(DOW FROM NOW())
							    WHEN 0 THEN 'Domingo'
							    WHEN 1 THEN 'Segunda'
							    WHEN 2 THEN 'Terça'
							    WHEN 3 THEN 'Quarta'
							    WHEN 4 THEN 'Quinta'
							    WHEN 5 THEN 'Sexta'
							    WHEN 6 THEN 'Sábado'
						      END AS dia_da_semana) in c.dia) > 0
	  		 GROUP BY c.turma) t
	  LEFT JOIN (SELECT c.turma,
	                    COUNT(c.turma) AS "presentes"
	             from candidatos c
	             JOIN presenca p ON c.nr_inscricao = p.nr_inscricao
	             WHERE p.data_presenca = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date 
	               and POSITION((SELECT 
								  CASE EXTRACT(DOW FROM NOW())
								    WHEN 0 THEN 'Domingo'
								    WHEN 1 THEN 'Segunda'
								    WHEN 2 THEN 'Terça'
								    WHEN 3 THEN 'Quarta'
								    WHEN 4 THEN 'Quinta'
								    WHEN 5 THEN 'Sexta'
								    WHEN 6 THEN 'Sábado'
							      END AS dia_da_semana) in c.dia) > 0
	             GROUP BY c.turma ) p 
	  ON t.turma = p.turma
	  LEFT JOIN (SELECT c.turma,
	                    COUNT(c.turma) AS "ausentes"
	             FROM candidatos c
	             WHERE c.nome NOT IN (SELECT c.nome
	                                  FROM presenca p
	                                  RIGHT JOIN candidatos c
	                                  ON c.nr_inscricao = p.nr_inscricao 
	                                  WHERE p.data_presenca = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date)
	                                  and POSITION((SELECT 
													  CASE EXTRACT(DOW FROM NOW())
													    WHEN 0 THEN 'Domingo'
													    WHEN 1 THEN 'Segunda'
													    WHEN 2 THEN 'Terça'
													    WHEN 3 THEN 'Quarta'
													    WHEN 4 THEN 'Quinta'
													    WHEN 5 THEN 'Sexta'
													    WHEN 6 THEN 'Sábado'
												      END AS dia_da_semana) in c.dia) > 0
	                                  GROUP BY c.turma) a
	  ON t.turma = a.turma
	  order by LPAD(SUBSTRING(t.turma, 6), 10, '0');`);

        const totalPresentes = await client.query(`
        select count(*) as total
        from candidatos c join presenca p 
        on c.nr_inscricao = p.nr_inscricao 
        where data_presenca = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date
        and POSITION((SELECT 
                    CASE EXTRACT(DOW FROM NOW())
                        WHEN 0 THEN 'Domingo'
                        WHEN 1 THEN 'Segunda'
                        WHEN 2 THEN 'Terça'
                        WHEN 3 THEN 'Quarta'
                        WHEN 4 THEN 'Quinta'
                        WHEN 5 THEN 'Sexta'
                        WHEN 6 THEN 'Sábado'
                    END AS dia_da_semana) in c.dia) > 0; 
        `);

        const totalAusentes = await client.query(`
        SELECT count(*) as total
        FROM candidatos c LEFT JOIN presenca p
        ON c.nr_inscricao = p.nr_inscricao 
        and p.data_presenca = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date 
        WHERE p.nr_inscricao IS null
        and POSITION((SELECT 
                    CASE EXTRACT(DOW FROM NOW())
                        WHEN 0 THEN 'Domingo'
                        WHEN 1 THEN 'Segunda'
                        WHEN 2 THEN 'Terça'
                        WHEN 3 THEN 'Quarta'
                        WHEN 4 THEN 'Quinta'
                        WHEN 5 THEN 'Sexta'
                        WHEN 6 THEN 'Sábado'
                    END AS dia_da_semana) in c.dia) > 0; 
        `);

        res.render('index.ejs', {
            info: info.rows,
            totalPresentes: parseInt(totalPresentes.rows[0].total),
            totalAusentes: parseInt(totalAusentes.rows[0].total),
            total: parseInt(totalPresentes.rows[0].total) + parseInt(totalAusentes.rows[0].total)
        });
        console.log(info.rows);
        client.release();
    } catch (err) {
        res.send("Erro ao obter dados: " + err);
    }
})



app.get('/presentes', async (req, res) => {
    const client = await pool.connect();

    try {
        const presentes = await client.query(`
        select nome, c.nr_inscricao, turma, dia, sala, professor 
        from candidatos c join presenca p 
        on c.nr_inscricao = p.nr_inscricao 
        where data_presenca = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date 
        and POSITION((SELECT 
                    CASE EXTRACT(DOW FROM NOW())
                        WHEN 0 THEN 'Domingo'
                        WHEN 1 THEN 'Segunda'
                        WHEN 2 THEN 'Terça'
                        WHEN 3 THEN 'Quarta'
                        WHEN 4 THEN 'Quinta'
                        WHEN 5 THEN 'Sexta'
                        WHEN 6 THEN 'Sábado'
                    END AS dia_da_semana) in c.dia) > 0
        order by LPAD(SUBSTRING(c.turma, 6), 10, '0'), nome asc;`);

        res.render('candidatos_presentes.ejs', { presentes: presentes.rows });
        client.release();
    } catch (err) {
        res.send("Erro ao obter dados: " + err);
    }
})

app.get('/ausentes', async (req, res) => {
    const client = await pool.connect();

    try {
        const ausentes = await client.query(`
        SELECT c.nome, c.nr_inscricao, c.turma, c.dia, c.sala, c.professor 
        FROM candidatos c LEFT JOIN presenca p
        ON c.nr_inscricao = p.nr_inscricao 
        and p.data_presenca = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date
        WHERE p.nr_inscricao IS null
        and POSITION((SELECT 
                    CASE EXTRACT(DOW FROM NOW())
                        WHEN 0 THEN 'Domingo'
                        WHEN 1 THEN 'Segunda'
                        WHEN 2 THEN 'Terça'
                        WHEN 3 THEN 'Quarta'
                        WHEN 4 THEN 'Quinta'
                        WHEN 5 THEN 'Sexta'
                        WHEN 6 THEN 'Sábado'
                    END AS dia_da_semana) in c.dia) > 0
        order by LPAD(SUBSTRING(c.turma, 6), 10, '0'), nome asc
        `);

        res.render('candidatos_ausentes.ejs', { ausentes: ausentes.rows });
        
        client.release();
    } catch (err) {
        res.send("Erro ao obter dados: " + err);
    }
})