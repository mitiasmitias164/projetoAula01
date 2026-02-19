Quero construir uma aplicação web chamada:

SISTEMA INTELIGENTE DE GESTÃO DE TURMAS DE IA

Objetivo:
Criar um sistema para gerenciar inscrições, controle de vagas, presença, avaliação e exportação de dados para cursos presenciais sobre Inteligência Artificial.

A aplicação deve possuir dois perfis de usuário:

1. PROFESSOR (participante)
2. GESTOR (administrador)

---

## 1. PERFIL PROFESSOR

Fluxo:

### Cadastro
Campos obrigatórios:
- Nome completo
- E-mail
- Telefone
- Campus onde leciona
- Nível de ensino (multi-seleção)

Após cadastro, o professor poderá visualizar turmas disponíveis.

### Inscrição em Turma

Cada turma deve conter:
- Campus
- Data
- Horário (início e fim)
- Local
- Capacidade máxima (20 vagas)
- Status (ABERTA ou ENCERRADA)

Regras:
- Quando a turma atingir 20 inscritos ativos, ela deve desaparecer da lista pública.
- Se um inscrito cancelar, a vaga deve ser liberada automaticamente.
- Um professor não pode se inscrever duas vezes na mesma turma.
- Deve haver botão de cancelamento de inscrição.

---

## 2. PERFIL GESTOR

Login obrigatório.

O gestor terá um painel administrativo com:

### Gestão de Turmas
- Criar nova turma
- Editar turma
- Excluir turma
- Listar turmas por campus/data
- Alterar status da turma

### Detalhamento da Turma
Ao clicar em uma turma, o gestor deve visualizar:
- Lista de inscritos
- Status da inscrição
- Botão para marcar presença (Presente / Não Presente)
- Registro de quem marcou presença e quando

---

## 3. LÓGICA DE PRESENÇA E AVALIAÇÃO

Regras:

- Apenas participantes marcados como PRESENTES podem receber o link de avaliação.
- Após a turma ser finalizada pelo gestor, o sistema deve:
    - Liberar automaticamente o formulário de avaliação apenas para presentes.
- A avaliação deve conter:
    - Perguntas objetivas
    - Campo opcional de comentário
    - Nota NPS (0–10)
- A avaliação deve ficar vinculada à turma e ao usuário.

---

## 4. EXPORTAÇÃO DE DADOS

O gestor deve poder exportar:

- Lista de inscritos (CSV)
- Lista de presença (CSV)
- Resultados da avaliação (CSV)

---

## 5. ESTRUTURA DE DADOS

Crie as seguintes entidades:

User
- id
- nome
- email
- telefone
- role (PROFESSOR ou GESTOR)

Campus
- id
- nome

Turma
- id
- campus_id
- data
- hora_inicio
- hora_fim
- local
- capacidade (default 20)
- status

Inscricao
- id
- turma_id
- user_id
- status (ATIVA ou CANCELADA)
- created_at

Presenca
- id
- turma_id
- user_id
- presente (boolean)
- marcado_por
- marcado_em

Avaliacao
- id
- turma_id
- user_id
- respostas
- nps
- comentario
- enviada_em

---

## 6. REGRAS CRÍTICAS DE NEGÓCIO

- O sistema deve validar capacidade diretamente no banco para evitar duas pessoas pegarem a última vaga.
- Turmas lotadas não devem aparecer para inscrição.
- Cancelamento deve reabrir vaga automaticamente.
- Avaliação só pode ser enviada uma vez por usuário por turma.
- Professor só acessa avaliação se tiver presença confirmada.

---

## 7. MVP

Primeira versão deve incluir:

- Autenticação simples para gestor
- Cadastro público de professor
- Controle dinâmico de vagas
- Painel de gestão de turmas
- Marcação de presença
- Avaliação vinculada # Em andamento
- Exportação CSV

Não incluir ainda:
- Certificado automático
- Integração com Google Calendar
- IA preditiva

Esses recursos serão desenvolvidos na versão 2.

---

## 8. INTERFACE

Interface simples, moderna e minimalista.
Foco em clareza e usabilidade.
Painel do gestor com visualização em tabela.
Lista de turmas para professor em formato de cards.

---

Construa a aplicação já com estrutura escalável, preparada para futuras integrações (Google Calendar, emissão automática de certificado e relatórios com IA).