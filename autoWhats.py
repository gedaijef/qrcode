###### Rotina criada para automatizar envio de mensagens no whatsapp,
# com base em um dataset com lista de contatos, retirados do excel.
# É importante que os dados da planilha estejam bem organizados. 
# A mensagem deve ser escrita diretamente no excel.
# É necessário alterar aqui no código o nome da planilha conforme o uso
# É importante o uso com cuidado, pois o whatsapp não gosta de automação que
# não seja oficial por API, e poderá bloquear o usuário.
# IMPORTANTE NÃO USAR O COMPUTADOR ENQUANTO AS MENSAGENS ESTÃO SENDO ENVIADAS
from os import stat_result
from numpy.lib.function_base import vectorize
import pandas as pd
import webbrowser as wb
import pywhatkit as zap
import numpy as np
from pandas.io.formats.format import TextAdjustment
import pyautogui as auto
import time

caminho = 'C:\\Users\Marcelo Grilo\\OneDrive - Instituto Germinare\\General\\2023\\GerminareTECH\\Planejamento\\Aulas\\2ªSerie\\ADD\\Automacao_ZAP\\telefone_alunos.xlsx'
#formação do dataframe 'dados' necessário ajustar nome do arquivo e planilha
dados = pd.read_excel (caminho, sheet_name="Escola")

nomeAlunos = dados["pri_nome"] #vetor para coluna pri_nome
telefone = dados["telefone"] #vetor para coluna telefone
mensagem = dados["mensagem"] #vetor para colana mensagem
# vectorize = nomeAlunos
# vectorize = telefone
# vectorize = mensagem

for i in range(len(nomeAlunos)): #percorre até tamanho da lista de alunos
    #abre link do whatsapp web concatenado com telefone, nome e mensagem
    # A linha abaixo manda pelo PywhatKIT (sendwhatmsg function)
    # os ultimos parametros da funcao abaixo sao: hora, minutos.
    zap.sendwhatmsg("+55"+str(telefone[i]), mensagem[i], 12, 33)
    
    # A linha abaixo manda pelo webbrowser (precisa ter, ou o whatsapp instalado na maquina(API) ou logado no whatsappweb)
    #wb.open('https://api.whatsapp.com/send/?phone=+55'+str(telefone[i])+'&text='+nomeAlunos[i]+', '+mensagem[i])
    wb.open('https://web.whatsapp.com/send/?phone=+55'+str(telefone[i])+'&text='+nomeAlunos[i]+', '+mensagem[i])
    time.sleep(15)#pausa para dar tempo de abrir o whatsapp web, necessário ajustar conforme a velocidade do computador
    auto.press("enter") #tecla enter na mensagem já dentro do whatsapp web
    time.sleep(5.5)
    i+=1