# TDDR Video Renderer

Worker Node para renderizar vídeos verticais e artes sociais do Estúdio Editorial IA com Remotion e FFmpeg.

Este serviço não precisa rodar dentro do plugin WordPress. Em produção, especialmente quando o WordPress está em hospedagem compartilhada, rode este worker em um VPS ou serviço Node separado e configure a URL no admin do plugin.

## Requisitos

- Node.js 20 ou superior.
- Dependências instaladas com `npm install`.
- Chrome/Chromium disponível para o Remotion.
- FFmpeg disponível no ambiente de execução.

## Execução local

```bash
npm install
npm run dev
```

Por padrão, o servidor escuta apenas em `127.0.0.1:4788`.

Variáveis úteis:

```bash
PORT=4788
TDDR_VIDEO_API_KEY=uma-chave-interna
TDDR_VIDEO_PUBLIC_BASE_URL=http://127.0.0.1:4788
```

## Produção

Em produção, configure:

```bash
PORT=4788
TDDR_VIDEO_API_KEY=uma-chave-longa-e-secreta
TDDR_VIDEO_PUBLIC_BASE_URL=https://worker.seudominio.com
```

No WordPress, use os mesmos valores em:

- `URL do worker de vídeo`;
- `Chave interna do worker de vídeo`.

O endpoint `/health` é usado pelo diagnóstico do admin. Se `TDDR_VIDEO_API_KEY` estiver configurada, o diagnóstico precisa enviar o header `X-TDDR-Video-Key`.

## API

`GET /health`

Retorna status, versão, URL pública, capabilities e disponibilidade do storage.

`POST /render`

Cria um job assíncrono. Quando `TDDR_VIDEO_API_KEY` estiver configurada, envie o header `X-TDDR-Video-Key`.

```json
{
  "postId": 123,
  "title": "Lua cheia em Escorpião",
  "caption": "Legenda social aprovada.",
  "cta": "Calcule seu mapa astral gratuito",
  "brand": "Toque de Despertar",
  "durationSeconds": 30,
  "audioUrl": "https://toquededespertar.com.br/wp-content/uploads/tddr-ai-audio/post-123.mp3",
  "hashtags": ["#astrologia", "#autoconhecimento"],
  "scenes": [
    {
      "title": "Observe o ciclo",
      "body": "A Lua ilumina emoções e padrões que pedem consciência."
    }
  ]
}
```

`POST /social-art`

Cria um job assíncrono para gerar arte social quadrada e vertical. A arte quadrada sai como PNG e a vertical como JPG para uso como capa de Reels.

```json
{
  "postId": 123,
  "baseImageUrl": "https://toquededespertar.com.br/wp-content/uploads/imagem.jpg",
  "title": "Lua Nova em Áries",
  "subtitle": "intenção, recomeços e escuta interna",
  "badge": "Astrologia",
  "brand": "Toque de Despertar",
  "formats": ["square", "vertical"],
  "template": "editorial-cover-v1"
}
```

`GET /jobs/{id}`

Consulta status e progresso de vídeo ou arte social. Para vídeo, retorna `outputUrl` e `coverUrl`. Para arte social, retorna `squareUrl` e `verticalUrl` quando concluído.

Os arquivos finais ficam em `public/media/` e os metadados dos jobs em `data/jobs/`.

## Deploy com Dockge e Cloudflare Tunnel

Use `compose.dockge.yml` como base para criar um stack no Dockge. Antes de subir:

- Troque `TDDR_VIDEO_API_KEY` por uma chave forte e copie o mesmo valor para o admin do WordPress.
- Mantenha `TDDR_VIDEO_PUBLIC_BASE_URL=https://worker.vazin.com.br` se esse for o hostname público do worker.
- Depois que o container estiver ativo, crie no Cloudflare Tunnel uma rota HTTP para `worker.vazin.com.br` apontando para `http://192.168.0.83:4788`.
- Deixe o campo `Path` vazio na rota do Tunnel, para publicar todos os endpoints do worker.

O stack usa volumes locais `./data` e `./public` para preservar jobs e arquivos gerados entre reinícios.
