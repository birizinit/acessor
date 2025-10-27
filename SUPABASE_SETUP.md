# Configuração do Supabase

Este documento explica como configurar a autenticação com Supabase no projeto.

## 1. Configuração do Projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a URL do projeto e a chave anônima (anon key)

## 2. Configuração das Variáveis de Ambiente

1. Copie o arquivo `.env.local.example` para `.env.local`
2. Preencha as variáveis com seus dados do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 3. Configuração do Banco de Dados

1. Acesse o SQL Editor no painel do Supabase
2. Execute o script SQL do arquivo `supabase-schema.sql` para criar a tabela de usuários

## 4. Configuração de Autenticação

1. No painel do Supabase, vá para Authentication > Settings
2. Configure as URLs permitidas:
   - Site URL: `http://localhost:3000` (desenvolvimento)
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 5. Funcionalidades Implementadas

### Autenticação
- Login com email e senha
- Cadastro de novos usuários
- Gerenciamento de sessão
- Proteção de rotas

### Perfil do Usuário
- Armazenamento de dados pessoais (nome, sobrenome, CPF, telefone, data de nascimento)
- Campo opcional para API Token
- Atualização de perfil

### API Token
- Campo opcional no cadastro para integração com APIs externas
- Armazenamento seguro no banco de dados
- Acesso via API autenticada

## 6. Estrutura dos Arquivos

- `lib/supabase.ts` - Configuração do cliente Supabase
- `contexts/AuthContext.tsx` - Contexto de autenticação React
- `app/login/page.tsx` - Página de login e cadastro
- `app/api/user/route.ts` - API para gerenciar dados do usuário
- `supabase-schema.sql` - Schema do banco de dados

## 7. Uso

### No Frontend
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, userProfile, signIn, signOut } = useAuth()
  
  // Usar dados do usuário
  console.log(user?.email)
  console.log(userProfile?.api_token)
}
```

### Na API
```typescript
// As rotas da API já estão protegidas e retornam dados do usuário autenticado
const response = await fetch('/api/user')
const userData = await response.json()
```

## 8. Próximos Passos

1. Configure as variáveis de ambiente
2. Execute o script SQL no Supabase
3. Teste o login e cadastro
4. Configure as URLs de redirecionamento para produção