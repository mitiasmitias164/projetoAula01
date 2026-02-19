# Sistema Inteligente de Gestão de Turmas de IA

Sistema web para gerenciamento de inscrições, presença e avaliações de cursos presenciais sobre Inteligência Artificial.

## 🚀 Tecnologias

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS com suporte a Dark Mode
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React

## 📁 Estrutura do Projeto

```
programaAulas/
├── backend/                 # API e lógica de dados
│   ├── config/              # Configuração Supabase
│   ├── api/                 # Camadas de API
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilitários (CSV export)
│   └── sql/                 # Schema e functions SQL
│       ├── schema.sql       # Estrutura do banco
│       ├── functions.sql    # Funções atômicas
│       └── rls-policies.sql # Políticas de segurança
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # React hooks customizados
│   │   ├── contexts/       # Contexts (Auth, etc)
│   │   └── utils/          # Funções auxiliares
│   └── public/             # Arquivos estáticos
└── .env.example            # Template de variáveis de ambiente
```

## ⚙️ Configuração

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL na seguinte ordem:
   - `backend/sql/schema.sql` - Cria tabelas e índices
   - `backend/sql/functions.sql` - Funções do banco
   - `backend/sql/rls-policies.sql` - Políticas de segurança

### 2. Variáveis de Ambiente

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis com suas credenciais do Supabase:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

### 3. Instalar Dependências

```bash
cd frontend
npm install
```

## 🏃 Executar Aplicação

### Desenvolvimento

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Produção

```bash
cd frontend
npm run build
npm run preview
```

## 👥 Perfis de Usuário

### PROFESSOR (Participante)
- Cadastro público
- Visualização de turmas disponíveis
- Inscrição/cancelamento em turmas
- Visualização de suas inscrições
- Acesso a avaliações (se presente)

### GESTOR (Administrador)
- Login obrigatório
- Gerenciamento de turmas (criar/editar/excluir)
- Visualização de inscritos por turma
- Marcação de presença
- Exportação de relatórios (CSV)

## 🔐 Segurança

- **Row Level Security (RLS)** no Supabase
- **Funções atômicas** para prevenir condições de corrida
- **Validação de entrada** com Zod
- **Autenticação** via Supabase Auth
- **Controle de acesso** baseado em roles

## 📊 Funcionalidades Principais

### Controle de Vagas
- Limite de 20 vagas por turma
- Verificação atômica de disponibilidade
- Reabertura automática ao cancelar inscrição
- Turmas lotadas não aparecem na lista pública

### Sistema de Presença
- Apenas gestores podem marcar presença
- Registro de quem marcou e quando
- Vinculado ao acesso de avaliação

### Avaliações
- Apenas para participantes presentes
- Uma avaliação por usuário por turma
- Perguntas objetivas + NPS (0-10) + comentários
- Exportação em CSV

## 🎨 UI/UX (Clean SaaS)

- **Header**: Logo à esquerda, perfil à direita
- **Mobile First**: Componentes empilháveis
- **Cores**:
  - Azul Escuro (#1e3a8a): Ações primárias
  - Amarelo (#fbbf24): Botões de destaque
- **Dark Mode**: Suporte nativo

## 📝 Licença

Proprietary - Todos os direitos reservados
