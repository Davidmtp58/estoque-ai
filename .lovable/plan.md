# Autenticação com roles + 2FA por email

## 1. Backend (Supabase)

### Tabelas
- `app_role` enum: `admin | gerente | estoquista`
- `profiles` (user_id PK→auth.users, name, email, cargo, branch, ativo bool, must_change_password bool, two_factor_enabled bool)
- `user_roles` (id, user_id, role) — separada por segurança
- `two_factor_codes` (user_id, code_hash, expires_at, consumed) — códigos OTP de 6 dígitos, expira em 10 min

Função `has_role(uuid, app_role)` security definer. RLS:
- `profiles`: usuário lê/atualiza o próprio; admin lê/atualiza todos
- `user_roles`: usuário lê o próprio; só admin gerencia
- `two_factor_codes`: só service_role
- `products`: leitura para qualquer authenticated; INSERT/UPDATE admin+gerente+estoquista; DELETE só admin

Trigger `on_auth_user_created` cria profile + role default.

### Edge functions (necessárias porque admin cria usuários e envia email com senha temporária)
- `admin-create-user`: admin chama; service-role cria auth user com senha temp, profile, role; envia email (Resend) com senha
- `admin-reset-password`: admin chama; gera nova senha temp, atualiza, envia email
- `send-2fa-code`: gera código 6 dígitos, salva hash, envia email
- `verify-2fa-code`: valida código, marca consumido, retorna ok

(Uso Resend via secret RESEND_API_KEY — pedir ao usuário)

## 2. Frontend

### Auth store / context
`src/lib/auth-context.tsx`: expõe `user`, `profile`, `role`, `loading`, `can(action)`.

### Telas auth
- `/login`: email+senha. Após signIn: se `must_change_password` → `/trocar-senha`; senão chama `send-2fa-code` e vai p/ `/login-2fa`
- `/login-2fa`: OTP 6 dígitos + reenviar (60s countdown) + voltar
- `/trocar-senha`: nova senha + confirmar; depois força setup 2FA (apenas confirma email recebendo código)
- `/recuperar-senha` e `/nova-senha`: já existem

### Gate por role
`_authenticated/route.tsx` já existe. Adicionar checagem de `ativo` (signOut se false) e `must_change_password` (redirect).
Novo `_authenticated/_admin/route.tsx` para rotas só-admin.

### Sidebar e BottomNav dinâmicos
Filtrar `navItems` por role:
- admin: todos + Usuários
- gerente: Produtos, Entrada, Saída, Relatório, Alertas, Histórico, Sugestão IA, Perfil
- estoquista: Produtos, Entrada, Saída, Alertas, Perfil

### Páginas novas
- `/admin/usuarios`: lista com avatar/nome/email/role badge/filial/status, botão Novo usuário
- `/admin/usuarios/novo`: formulário (nome/email/cargo/filial/role) → chama `admin-create-user`
- Modal edição: alterar nome/cargo/filial/role/ativo, resetar senha, remover

### Restrições UI
- `ProductCard`: ocultar "Excluir" para não-admin
- `Perfil`: badge de role colorido (admin teal, gerente âmbar, estoquista cinza)

### Mock seed
Inserir 3 profiles+roles (David admin, João estoquista, Maria gerente) via migration `INSERT` apenas se o auth user existir — na prática: criar via admin-create-user manualmente, ou seed só de profiles vazios (sem auth users) para a lista mostrar algo. **Decisão**: criar apenas o admin David automaticamente no primeiro deploy via edge function de bootstrap; demais usuários o admin cria pela UI.

## 3. Secret necessário
`RESEND_API_KEY` para envio de emails (senha temp + código 2FA). Vou pedir após aprovação do plano.

## Confirmação
Posso prosseguir? Pontos a confirmar:
1. Email transacional via **Resend** (precisa de API key) — ok? Alternativa: usar Lovable email infra (mais setup mas sem chave externa).
2. Usuário David admin: criar com senha provisória **fixa** (`Admin@2026`) no primeiro deploy, ou você prefere informar email/senha?
3. O fluxo de 2FA no primeiro login: configurar = apenas validar que o email recebe o código (ativando `two_factor_enabled=true`), ou quer também opção de desativar depois?
