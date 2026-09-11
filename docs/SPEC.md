# Especificação — Catálogo 4K Ternos

## Objetivo

Adicionar um catálogo comercial mobile-first ao provador existente, preservando a rota `/`, com administração protegida e compra direcionada ao WhatsApp da loja.

## Checklist funcional

- [x] Preservar o provador de medidas em `/`
- [x] Permitir apagar os campos numéricos no celular e bloquear o avanço enquanto algum valor estiver vazio ou inválido
- [x] Adicionar na raiz acessos rápidos ao catálogo, Instagram e WhatsApp
- [x] Criar catálogo em `/catalogo`
- [x] Exibir carrossel, título, descrição resumida, preço e parcelamento
- [x] Abrir detalhes completos em `/catalogo/[slug]`
- [x] Gerar mensagem do item e direcionar a compra para o WhatsApp `+55 17 99761-4534`
- [x] Exibir todas as categorias inicialmente e permitir filtrar uma categoria
- [x] Busca por título/descrição/categoria
- [x] Alternar visualização em 1, 2, 4 ou 8 colunas (adaptada à largura disponível)
- [x] Paginação com 10, 20 ou 50 itens por página
- [x] Criar login administrativo em `/login`
- [x] Criar painel em `/admin` para categorias, produtos e múltiplas imagens
- [x] Permitir criar, editar, ativar/desativar e excluir produtos
- [x] Pré-cadastrar cinco produtos demonstrativos
- [x] Interface mobile-first com alvos de toque, menu e filtros responsivos

## Checklist técnico e de segurança

- [x] PostgreSQL com migração SQL versionada e consultas parametrizadas
- [x] Backend em Route Handlers do Next.js, separado dos componentes de interface
- [x] Senhas armazenadas apenas como hash bcrypt
- [x] JWT assinado em cookie HttpOnly, Secure em produção e SameSite Strict
- [x] Validação de entrada no servidor com Zod
- [x] Proteção de mutações por autenticação, perfil administrativo e validação de origem
- [x] Limite persistente de tentativas de login
- [x] Bucket MinIO privado `ternos`; arquivos organizados por produto
- [x] Upload validado por MIME e tamanho; nomes de objetos gerados pelo servidor
- [x] Imagens entregues por endpoint público sem expor credenciais do MinIO
- [x] Segredos ignorados pelo Git e `.env.example` sem valores reais
- [x] Docker multi-stage executando Next.js standalone
- [x] Health check de aplicação/banco em `/api/health`
- [x] Lint e build de produção validados

## Contratos principais

- `GET /api/catalog`: paginação, busca, categoria e ordenação; somente produtos ativos.
- `POST /api/auth/login`: autentica e cria cookie de sessão JWT.
- `POST /api/auth/logout`: encerra a sessão.
- `GET|POST /api/admin/products`: consulta e criação administrativa.
- `GET|PUT|DELETE /api/admin/products/:id`: detalhe, atualização e exclusão.
- `POST /api/admin/products/:id/images`: upload multipart de imagens.
- `DELETE /api/admin/images/:id`: remoção da imagem e do objeto.
- `GET|POST /api/admin/categories`: consulta/criação de categorias.
- `GET /api/images/:id`: entrega uma imagem do bucket privado.

## Critérios de aceite

O catálogo deve ser plenamente utilizável a partir de 360 px, não expor segredos no bundle, manter filtros/paginação na URL, criar uma mensagem legível no WhatsApp e bloquear toda API administrativa sem uma sessão válida.
