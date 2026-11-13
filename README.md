# Site da Luciana Ferreira – Psicóloga Clínica

Site estático de página única (HTML, CSS e JS puros). Não precisa de build.

## Estrutura
- `index.html`: conteúdo da página
- `politica-de-privacidade.html`: rascunho, revisar antes de publicar
- `assets/css/style.css`: estilos e paleta (variáveis no topo)
- `assets/js/main.js`: WhatsApp, Instagram e menu mobile
- `assets/img/`: logo e foto principal
- `vercel.json`, `robots.txt`, `sitemap.xml`: publicação e SEO

## Onde editar
- **WhatsApp e mensagem inicial / Instagram**: `assets/js/main.js` (topo do arquivo)
- **Horários, valores e textos**: `index.html`
- **Cores**: variáveis `:root` em `assets/css/style.css`

## Publicar na Vercel
1. Em vercel.com, clique em **Add New → Project** e importe o repositório `nckfpsdev/portifolio-luciana`.
2. **Framework Preset:** Other. Deixe Build Command e Output Directory em branco (o site é estático e a raiz é a pasta do projeto).
3. Em **Production Branch**, use a branch principal depois de mesclar esta.
4. Clique em **Deploy**. Cada novo commit publica automaticamente.

## Domínio
No projeto, **Settings → Domains**, adicione `lucianaferreirapsi.com.br` e `www.lucianaferreirapsi.com.br`.
Na Vercel aparecem os registros DNS (A para o domínio raiz e CNAME para `www`). Eles precisam ser configurados onde o domínio está registrado. Enquanto isso, o site funciona no endereço `*.vercel.app`.

## Antes de divulgar
- Revisar a política de privacidade e os textos de neuromodulação e Sala Lilás com a profissional.
- Definir e incluir a política de cancelamento (ainda não incluída).
- Conferir CRP, horários, WhatsApp e endereço.
