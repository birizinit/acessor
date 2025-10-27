# Configuração do Supabase

Este documento explica como configurar o Supabase para autenticação e armazenamento de arquivos.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: Nome do seu projeto
   - **Database Password**: Senha forte para o banco
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)

## 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. No painel do Supabase, vá em **Settings > API**
3. Copie as seguintes informações:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys > anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Preencha o arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   DATABASE_URL=sua_url_do_banco_existente
   ```

## 3. Configurar Banco de Dados

Execute a migração para adicionar os campos do Supabase:

```bash
# Se usando Drizzle
pnpm db:push

# Ou execute o SQL diretamente no seu banco
psql $DATABASE_URL -f migrations/001_add_supabase_fields.sql
```

## 4. Configurar Storage para Imagens

1. No painel do Supabase, vá em **Storage**
2. Clique em **Create a new bucket**
3. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ (marcado)
   - **File size limit**: 50MB
   - **Allowed MIME types**: `image/*`

## 5. Configurar Políticas de Segurança

### Política para Storage (avatars)

1. Vá em **Storage > Policies**
2. Clique em **New Policy** para o bucket `avatars`
3. Use este template:

```sql
-- Política para permitir upload de avatares
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir visualização de avatares
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir atualização de avatares
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir exclusão de avatares
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 6. Configurar Autenticação

1. Vá em **Authentication > Settings**
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento) ou sua URL de produção
   - **Redirect URLs**: Adicione `http://localhost:3000/**` e sua URL de produção
   - **Email confirmation**: ✅ (recomendado)
   - **Email change confirmation**: ✅ (recomendado)

## 7. Testar a Integração

1. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

2. Acesse `http://localhost:3000/login`
3. Teste:
   - Criar uma nova conta
   - Fazer login
   - Upload de foto de perfil
   - Configurar API token
   - Logout

## 8. Estrutura do Banco de Dados

A tabela `users` agora inclui:

- `id`: ID interno (serial)
- `supabase_id`: ID do usuário no Supabase Auth (UUID)
- `email`: Email do usuário
- `full_name`: Nome completo
- `profile_image`: URL da imagem de perfil (Supabase Storage)
- `api_token`: Token da API externa (MyBroker)
- `phone`: Telefone
- `cpf`: CPF
- `birth_date`: Data de nascimento
- `country`: País
- `city`: Cidade
- `gender`: Gênero
- `language`: Idioma (padrão: pt-br)
- `preferences`: Preferências em JSON
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## 9. Funcionalidades Implementadas

✅ **Autenticação**
- Login com email/senha
- Cadastro de usuários
- Logout
- Proteção de rotas

✅ **Perfil do Usuário**
- Upload de foto de perfil (Supabase Storage)
- Edição de dados pessoais
- Configuração de API token
- Persistência de dados

✅ **Integração com API Externa**
- Conexão com MyBroker API
- Sincronização de dados
- Armazenamento de token

## 10. Próximos Passos

- [ ] Implementar recuperação de senha
- [ ] Adicionar autenticação social (Google, GitHub)
- [ ] Implementar notificações por email
- [ ] Adicionar validação de CPF
- [ ] Implementar cache de dados
- [ ] Adicionar logs de auditoria