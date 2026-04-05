# 🚀 DeepDive Architecture

Plataforma interativa de estudo técnico aprofundado. Cada tema é um **slice** independente com conteúdo detalhado, referências e diagramas animados em Canvas 2D — sem simplificações, sem pular etapas.

A ideia é crescer organicamente: novos slices podem ser adicionados a qualquer momento sem alterar os existentes.

### Slices disponíveis

| Slice | Steps | Destaques |
|-------|-------|-----------|
| 🌐 Fundamentos de Redes | 6 | OSI/TCP-IP, Encapsulamento, DNS, TCP, UDP/QUIC, TLS 1.3 |
| ⚙️ Node.js Internals | 7 | syscalls, epoll/Event Loop, V8 Bindings, Thread Pool, Buffers, llhttp, Streams |
| 🧠 IA & LLMs | 8 | Redes Neurais, BPE, Embeddings, Positional Encoding, Transformer, Attention, Treinamento, Sampling |

<br>

## 📐 Arquitetura

Cada slice é isolado em sua própria pasta com dois arquivos:
- **`data.js`** — conteúdo textual, referências e metadados dos steps
- **`canvas.js`** — visualizações e animações Canvas 2D do slice

Para adicionar um novo slice basta criar a pasta em `src/slices/<nome>/`, exportar os dois arquivos e registrá-lo em `main.js`.

```
src/
├── main.js                    # Registra slices, Vue setup, watchers
├── shared/
│   ├── lib/engine.js          # BaseRenderer (Canvas 2D)
│   └── ui/styles.css          # Tema dark, layout responsivo
└── slices/
    ├── ai/                    # Slice: IA & LLMs
    │   ├── data.js
    │   └── canvas.js
    ├── networks/              # Slice: Fundamentos de Redes
    │   ├── data.js
    │   └── canvas.js
    └── nodejs/                # Slice: Node.js Internals
        ├── data.js
        └── canvas.js
```

**Stack:** HTML + CSS + JS (ES Modules) · [Vue 3](https://vuejs.org/) via CDN · Canvas 2D · Sem build step

<br>

## ▶️ Como Rodar

Projeto 100% estático — sem build, sem `npm install`. Sirva os arquivos com qualquer servidor HTTP:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

Ou use a extensão **Live Server** no VS Code (botão direito em `index.html` → Open with Live Server).

> ⚠️ Não abra via `file://` — ES Modules exigem servidor HTTP (CORS).

<br>

## 📄 Licença

Veja o arquivo [LICENSE](LICENSE).