# 🚀 DeepDive Architecture

Plataforma interativa de estudo técnico aprofundado sobre **fundamentos de computação**. Cada tema é um **slice** independente com conteúdo detalhado, referências primárias (RFCs, papers, código-fonte) e diagramas animados em Canvas 2D — sem simplificações, sem pular etapas.

### 🗺️ Roadmap de Aprendizado

Os slices formam um currículo coerente, dos fundamentos matemáticos até a inteligência artificial:

| # | Slice | Steps | Destaques |
|---|-------|-------|-----------|
| 1 | 📐 Matemática para CS | 6 | Lógica & Provas, Conjuntos & Relações, Combinatória & Probabilidade, Teoria dos Grafos, Álgebra Linear, Teoria dos Números & RSA |
| 2 | 💾 Estruturas de Dados & Algoritmos | 6 | Complexidade Big-O, Arrays & Linked Lists, Árvores BST/AVL & Heaps, Hash Tables & Grafos, Sorting, DP & Greedy |
| 3 | 🖥️ Arquitetura de Computadores | 6 | Von Neumann, Registradores & ISA, Cache L1/L2/L3, Pipeline & Branch Prediction, GPU vs CPU/SIMD, Memória Virtual |
| 4 | ⚙️ Sistemas Operacionais | 6 | Processos & PCB, CPU Scheduling (CFS), Threads & Concorrência, Memória & Paginação, Syscalls & I/O, File Systems |
| 5 | 🔄 Concorrência & Paralelismo | 6 | Amdahl's Law, Memory Models, Lock-Free CAS, Actor/CSP, MESI Cache Coherence, Async/Await & Coroutines |
| 6 | 🏗️ Compiladores & Interpretadores | 6 | Lexer & DFA, Parser & AST, Análise Semântica, IR & SSA, Otimizações, CodeGen/JIT/GC |
| 7 | 🌐 Fundamentos de Redes | 6 | OSI/TCP-IP, Encapsulamento, DNS, TCP Handshake, UDP/QUIC, TLS 1.3 |
| 8 | 🔐 Criptografia & Segurança | 6 | Hashing SHA-256, AES & Modos de Operação, RSA vs ECC, Diffie-Hellman/ECDHE, Certificados X.509/PKI, TLS 1.3 Deep Dive |
| 9 | 🗄️ Banco de Dados Internals | 6 | Storage Engines B-Tree vs LSM, Indexação B+Tree/Hash/GIN, Query Processing & CBO, Transações ACID & MVCC, Buffer Pool, Replicação |
| 10 | 🌍 Sistemas Distribuídos | 6 | CAP & 8 Fallacies, Relógios Lógicos, Consenso Raft, CRDTs, Consistent Hashing, Kafka/Spanner/Dynamo |
| 11 | 🧠 IA & LLMs | 8 | Redes Neurais, BPE, Embeddings, Positional Encoding, Transformer, Attention QKV, Treinamento, Sampling |

<br>

## 📐 Arquitetura

Cada slice é isolado em sua própria pasta com três arquivos:
- **`data.js`** — metadados dos steps (título, referências) e import do conteúdo
- **`content.js`** — conteúdo HTML de cada step em template literals legíveis
- **`canvas.js`** — visualizações e animações Canvas 2D do slice

Para adicionar um novo slice basta criar a pasta em `src/slices/<nome>/`, exportar os três arquivos e registrá-lo em `main.js`.

```
src/
├── main.js                    # Registra slices, Vue setup, watchers
├── shared/
│   ├── lib/engine.js          # BaseRenderer (Canvas 2D)
│   └── ui/styles.css          # Tema dark, layout responsivo
└── slices/
    ├── math/                  # 1. Matemática para CS
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── dsa/                   # 2. Estruturas de Dados & Algoritmos
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── cpu/                   # 3. Arquitetura de Computadores
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── os/                    # 4. Sistemas Operacionais
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── concurrency/           # 5. Concorrência & Paralelismo
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── compilers/             # 6. Compiladores & Interpretadores
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── networks/              # 7. Fundamentos de Redes
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── crypto/                # 8. Criptografia & Segurança
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── db/                    # 9. Banco de Dados Internals
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    ├── distributed/           # 10. Sistemas Distribuídos
    │   ├── data.js
    │   ├── content.js
    │   └── canvas.js
    └── ai/                    # 11. IA & LLMs
        ├── data.js
        ├── content.js
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