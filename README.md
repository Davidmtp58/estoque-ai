# EstoqueApp 📦

Sistema de controle de estoque para supermercados, desenvolvido como Projeto Final da disciplina de Engenharia de Prompt e Aplicações em IA — 1º Período de Ciência da Computação / ADS.

PWA (Progressive Web App) — funciona no navegador e pode ser instalado como app no celular ou desktop.

## 🔗 Acesso

- **Aplicação publicada:** https://esque-ai.lovable.app
- **Protótipo Figma:** https://www.figma.com/design/QN9GYRaOyFqadwPVUwjr7Z/EstoqueApp---Prot%C3%B3tipo-Mobile

## Equipe

- Guto Trajano
- Arthur Guilherme Silva Marques
- David Mangueira Trajano Pessoa
- Guilherme Joaquim Soares da Silva
- Raphael Hanon Souto de Almeida Junior

## Tecnologias

**Front-end:** React, TypeScript, Tailwind CSS, shadcn/ui, recharts, PWA (Vite)

**Back-end:** Lovable Cloud (Supabase), PostgreSQL, Supabase Auth, Row Level Security, Triggers PL/pgSQL, Edge Functions

**IA:** Integração com Gemini AI (Google) para análise inteligente de estoque

**Ferramentas de desenvolvimento:** Lovable, v0.dev, Figma, Claude Code

## Funcionalidades

- Cadastro, consulta, edição e exclusão de produtos
- Controle de entrada e saída de mercadorias com atualização automática do estoque
- Alertas de estoque mínimo e de validade próxima (estável / atenção / crítico)
- Histórico de movimentações com filtros e busca
- Relatórios gerenciais com gráficos de entradas e saídas
- Autenticação com controle de acesso por papel (admin / gerente / estoquista)
- Painel de gerenciamento de usuários (somente admin)
- Sugestão da IA: análise do estoque em tempo real via Gemini AI, com recomendações de ação e mensagem pronta para WhatsApp

## Arquitetura

O front-end consome diretamente os serviços do Lovable Cloud (Supabase) via SDK. Dois triggers em PL/pgSQL automatizam as regras de negócio centrais: `apply_movement` atualiza o estoque a cada entrada/saída registrada, e `compute_product_status` recalcula o status do produto considerando estoque mínimo e data de validade. A integração com a Gemini AI é feita via Edge Function, mantendo a chave de API protegida no back-end.

## Documentação

O relatório técnico completo, incluindo arquitetura detalhada, apêndice de prompts utilizados e análise do código gerado por IA, está disponível na pasta `/docs` deste repositório.

## Minha contribuição

No projeto, fiquei responsável principalmente pela definição do fluxo da aplicação e por decisões funcionais e técnicas do sistema.

Minhas principais contribuições foram:

- Implementação e configuração da integração com a API do Gemini para os recursos de Inteligência Artificial da aplicação.
- Definição do fluxo de navegação do usuário, estruturando o caminho desde o acesso ao sistema até as principais funcionalidades.
- Definição das camadas e regras de segurança da aplicação.
- Desenvolvimento e organização do dashboard, apresentando uma visão geral das entradas e saídas do estoque.
- Organização das responsabilidades da equipe durante a apresentação do projeto, distribuindo os tópicos e funcionalidades apresentados por cada integrante.
