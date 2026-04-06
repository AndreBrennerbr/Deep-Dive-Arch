const STEP_1 =
`<p>Todo computador moderno segue a arquitetura proposta por <strong>John von Neumann (1945)</strong> — um modelo onde <em>programa e dados vivem na mesma memória</em> e uma unidade central de processamento (CPU) executa instruções sequencialmente.</p>
<p>Os 4 componentes fundamentais:</p>
<div class="code-block">┌──────────────────────────────────────────────────┐
│                    CPU                           │
│  ┌─────────────────┐  ┌───────────────────────┐  │
│  │ Control Unit (CU)│  │ ALU (Arithmetic Logic)│  │
│  │  • PC (Program   │  │  • ADD, SUB, MUL, DIV │  │
│  │    Counter)      │  │  • AND, OR, XOR, NOT  │  │
│  │  • IR (Instruction│  │  • Comparações (CMP)  │  │
│  │    Register)     │  │  • Flags (Zero, Carry, │  │
│  │  • Decoder       │  │    Overflow, Sign)    │  │
│  └─────────────────┘  └───────────────────────┘  │
│           ┌──────────────────┐                    │
│           │   Registradores  │                    │
│           │  R0..R15 / RAX.. │                    │
│           └──────────────────┘                    │
└────────────────────┬─────────────────────────────┘
                     │ Barramento (Bus)
        ┌────────────┼────────────┐
        ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Memória  │ │  Disco   │ │   I/O    │
  │  (RAM)   │ │ (SSD/HD) │ │ (Teclado,│
  │ Dados +  │ │          │ │  Rede,   │
  │ Programa │ │          │ │  Tela)   │
  └──────────┘ └──────────┘ └──────────┘</div>
<p>O coração da execução é o <span class="highlight">ciclo Fetch-Decode-Execute</span>, que se repete bilhões de vezes por segundo:</p>
<div class="code-block">Loop infinito da CPU:

1. FETCH    → PC aponta para endereço na RAM
             → Instrução é copiada para o IR
             → PC incrementa (PC += tamanho da instrução)

2. DECODE   → Control Unit decodifica o opcode no IR
             → Identifica: qual operação? quais operandos?
             → Ativa os circuitos corretos da ALU

3. EXECUTE  → ALU realiza a operação
             → Resultado vai para registrador ou memória
             → Flags são atualizados (Zero? Overflow?)

4. REPEAT   → Volta ao passo 1</div>
<p>Em uma CPU moderna rodando a <strong>4 GHz</strong>, esse ciclo acontece ~4 bilhões de vezes por segundo. Cada ciclo de clock dura <strong>0.25 nanossegundos</strong> — a luz percorre apenas ~7.5 cm nesse tempo.</p>
<ul><li><strong>PC (Program Counter):</strong> Registrador especial que armazena o endereço da <em>próxima</em> instrução. Instruções de desvio (JMP, CALL, RET) alteram o PC para desviar o fluxo.</li><li><strong>IR (Instruction Register):</strong> Armazena a instrução <em>atual</em> sendo decodificada.</li><li><strong>ALU:</strong> Circuito combinacional que realiza operações aritméticas e lógicas. Não "pensa" — apenas produz saída determinística para cada entrada.</li><li><strong>Barramento:</strong> Conjunto de fios que conecta CPU ↔ Memória ↔ I/O. O <strong>bus de dados</strong> (64 bits) transporta valores, o <strong>bus de endereço</strong> (~48 bits) indica onde ler/escrever, o <strong>bus de controle</strong> sinaliza leitura ou escrita.</li></ul>
<p>A limitação deste modelo é o <strong>Von Neumann Bottleneck</strong>: como dados e instruções compartilham o mesmo barramento, a CPU gasta boa parte do tempo esperando a memória responder — razão pela qual caches existem (passo 3).</p>`;

const STEP_2 =
`<p>Registradores são <strong>memórias minúsculas dentro da CPU</strong> — extremamente rápidos (acesso em 1 ciclo de clock, ~0.25ns) mas em quantidade limitada. São o "espaço de trabalho" onde a ALU opera diretamente.</p>
<div class="code-block">Registradores x86-64 (AMD64):

  Propósito Geral (64 bits cada):
  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
  │ RAX │ RBX │ RCX │ RDX │ RSI │ RDI │ RBP │ RSP │
  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
  │ R8  │ R9  │ R10 │ R11 │ R12 │ R13 │ R14 │ R15 │
  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘

  Especiais:
  • RIP — Instruction Pointer (= Program Counter)
  • RFLAGS — Flags (Zero, Carry, Overflow, Sign...)
  • RSP — Stack Pointer (topo da pilha)
  • RBP — Base Pointer (base do stack frame)

  RAX subdivide-se:  RAX (64) → EAX (32) → AX (16) → AH|AL (8|8)</div>
<p>A <strong>ISA (Instruction Set Architecture)</strong> é o contrato entre software e hardware — define quais instruções existem, quais registradores, como a memória é endereçada. É a "API" da CPU.</p>
<p>Duas filosofias dominam:</p>
<div class="code-block">CISC (Complex Instruction Set)         RISC (Reduced Instruction Set)
────────────────────────────────       ─────────────────────────────────
• x86, x86-64 (Intel/AMD)             • ARM (Apple M1/M2, smartphones)
• Instruções de tamanho variável       • Instruções de tamanho fixo (4B)
  (1 a 15 bytes)
• Uma instrução pode fazer várias      • Uma instrução faz UMA coisa
  coisas: MOV [mem], [mem+reg*4]       • Load/Store separados da ALU
• ~1500+ instruções                    • ~200 instruções
• Decodificação complexa               • Decodificação simples e rápida
• Internamente traduz para µops       • Execução direta

Exemplo — somar dois valores:

  x86 (CISC):                          ARM (RISC):
  add eax, [rbx+rcx*4]                 ldr r2, [r1, r3, lsl #2]
  ; 1 instrução = load + add           add r0, r0, r2
                                       ; 2 instruções separadas</div>
<ul><li><strong>Modos de Endereçamento:</strong> Imediato (<code>MOV RAX, 42</code>), Registrador (<code>MOV RAX, RBX</code>), Direto (<code>MOV RAX, [0x1000]</code>), Indexado (<code>MOV RAX, [RBX + RCX*8]</code>).</li><li><strong>Calling Convention (System V AMD64):</strong> Argumentos de função nos registradores RDI, RSI, RDX, RCX, R8, R9 (nessa ordem). Retorno em RAX. O callee deve preservar RBX, RBP, R12-R15.</li><li><strong>Por que isso importa?</strong> Compiladores (GCC, Clang) traduzem seu código C/Rust/Go para instruções da ISA alvo. A ISA determina eficiência energética (ARM ganha), compatibilidade (x86 domina desktop) e performance bruta.</li></ul>`;

const STEP_3 =
`<p>A RAM é <strong>~100x mais lenta</strong> que a CPU. Se o processador acessasse a memória principal a cada instrução, ficaria parado 99% do tempo. A solução é a <span class="highlight">hierarquia de cache</span> — camadas de memória progressivamente maiores e mais lentas entre a CPU e a RAM.</p>
<div class="code-block">Hierarquia de Memória (latências típicas):

  Registradores  ──  ~0.25 ns    ~1 ciclo     64 × 64-bit
       │
  Cache L1       ──  ~1 ns       ~4 ciclos    32-64 KB   (por core)
       │              ↑ dados + instruções separados (Harvard)
  Cache L2       ──  ~4 ns       ~14 ciclos   256 KB-1MB (por core)
       │
  Cache L3       ──  ~12 ns      ~40 ciclos   8-64 MB    (compartilhado)
       │
  RAM (DDR5)     ──  ~80 ns      ~280 ciclos  16-128 GB
       │
  SSD (NVMe)     ──  ~20 µs      ~70.000 ciclos
       │
  HDD            ──  ~5 ms       ~17.000.000 ciclos</div>
<p>A cache funciona porque programas exibem dois padrões previsíveis:</p>
<ul><li><strong>Localidade Temporal:</strong> Se você acessou um dado agora, provavelmente vai acessá-lo de novo em breve (ex: variável de loop <code>i</code>).</li><li><strong>Localidade Espacial:</strong> Se você acessou o endereço X, provavelmente vai acessar X+1, X+2... em breve (ex: iterar um array).</li></ul>
<p>Quando a CPU precisa de um dado:</p>
<div class="code-block">CPU quer ler endereço 0x7FFF1234:

1. Procura em L1 → Cache Hit?  → Sim → retorna em ~1ns  ✓
                               → Não → Cache Miss, procura L2

2. Procura em L2 → Cache Hit?  → Sim → copia para L1, retorna ~4ns
                               → Não → Cache Miss, procura L3

3. Procura em L3 → Cache Hit?  → Sim → copia para L2→L1, retorna ~12ns
                               → Não → Cache Miss, vai para RAM

4. Busca na RAM → ~80ns → copia para L3→L2→L1

Hit Rate típico: ~95% em L1 → ~99% combinado L1+L2+L3</div>
<p>A cache opera em blocos chamados <strong>Cache Lines</strong> (tipicamente <strong>64 bytes</strong>). Quando ocorre um miss, a cache não busca apenas o byte pedido — traz a cache line inteira (64B), apostando na localidade espacial.</p>
<ul><li><strong>Associatividade:</strong> L1 tipicamente é 8-way set-associative — cada endereço pode ficar em 8 posições possíveis. Balanceia velocidade de busca vs. taxa de conflito.</li><li><strong>Write Policy:</strong> Write-back (escreve só na cache, marca como "dirty", sincroniza com RAM depois) é mais comum que write-through (escreve em cache + RAM simultaneamente).</li><li><strong>Cache Coherency (MESI):</strong> Em CPUs multi-core, o protocolo MESI (Modified/Exclusive/Shared/Invalid) garante que todos os cores veem dados consistentes. Se Core0 escreve em um endereço que Core1 tem em cache, o protocolo invalida a cópia de Core1.</li><li><strong>False Sharing:</strong> Se dois cores escrevem em variáveis <em>diferentes</em> que estão na mesma cache line, o protocolo MESI força invalidações constantes — destruindo performance. Solução: alinhar dados críticos em linhas separadas (<code>alignas(64)</code>).</li></ul>`;

const STEP_4 =
`<p>No modelo simples, a CPU executa uma instrução por vez: Fetch → Decode → Execute → Write-back, e só então começa a próxima. Isso desperdiça hardware — enquanto a ALU executa, a unidade de Fetch fica ociosa. A solução é o <span class="highlight">Pipeline</span>.</p>
<div class="code-block">Pipeline de 5 estágios (RISC clássico):

Ciclo:   1    2    3    4    5    6    7    8
       ┌────┬────┬────┬────┬────┐
Inst 1 │ IF │ ID │ EX │MEM │ WB │
       └────┼────┼────┼────┼────┼────┐
Inst 2      │ IF │ ID │ EX │MEM │ WB │
            └────┼────┼────┼────┼────┼────┐
Inst 3           │ IF │ ID │ EX │MEM │ WB │
                 └────┼────┼────┼────┼────┼────┐
Inst 4                │ IF │ ID │ EX │MEM │ WB │
                      └────┴────┴────┴────┴────┘

IF = Instruction Fetch    ID = Instruction Decode
EX = Execute              MEM = Memory Access
WB = Write-Back

Sem pipeline: 4 instruções = 20 ciclos
Com pipeline: 4 instruções = 8 ciclos (após o "enchimento")</div>
<p>CPUs modernas vão além — são <strong>Superscalar</strong>: executam <em>múltiplas instruções por ciclo</em>. Um Core i7 pode despachar até 6 µops por ciclo, usando múltiplas ALUs, unidades de load/store e portas de execução em paralelo.</p>
<p>O maior inimigo do pipeline é o <strong>branch (desvio condicional)</strong>:</p>
<div class="code-block">if (x > 0) {     →  CMP x, 0
    a = 1;       →  JLE else_label    ← Branch! Para onde vai?
} else {         →  MOV a, 1
    a = 2;       →  JMP end_label
}                →  else_label: MOV a, 2
                 →  end_label: ...

Problema: A CPU tem 15-20 instruções no pipeline.
Quando encontra o JLE, não sabe se vai pular ou não.
Se esperar, desperdiça ~15 ciclos. Se chutar errado, idem.</div>
<p>A solução é o <span class="highlight">Branch Predictor</span> — hardware dedicado que "aposta" no resultado do branch antes de conhecê-lo:</p>
<ul><li><strong>Preditor de 2 bits (saturating counter):</strong> Cada branch tem um contador de 2 bits (Strongly Not Taken → Weakly Not Taken → Weakly Taken → Strongly Taken). Precisa errar 2x consecutivas para mudar de ideia.</li><li><strong>Branch Target Buffer (BTB):</strong> Cache que mapeia o endereço do branch → endereço alvo. Permite que o Fetch já busque do endereço previsto sem esperar o Decode.</li><li><strong>Especulação:</strong> A CPU executa <em>especulativamente</em> pelo caminho previsto. Se a previsão estava certa (>97% das vezes), nenhum ciclo foi perdido. Se errou, faz <strong>pipeline flush</strong> — descarta todo o trabalho especulativo (~15 ciclos perdidos).</li><li><strong>Vulnerabilidades:</strong> Spectre e Meltdown (2018) exploram exatamente a execução especulativa para ler dados que não deveriam ser acessíveis, via side-channels nos tempos de cache.</li></ul>
<p><strong>Out-of-Order Execution:</strong> CPUs modernas não executam instruções na ordem do programa. O hardware analisa dependências e reordena instruções para manter todas as unidades ocupadas. Um <strong>Reorder Buffer (ROB)</strong> garante que os resultados sejam "commitados" na ordem original, preservando a semântica do programa.</p>`;

const STEP_5 =
`<p>Uma CPU é otimizada para <strong>latência</strong> — executar uma sequência de instruções o mais rápido possível, com branch prediction, caches enormes e out-of-order execution. Uma GPU é otimizada para <strong>throughput</strong> — executar a <em>mesma operação</em> em milhares de dados simultaneamente.</p>
<div class="code-block">CPU (poucos cores poderosos)           GPU (milhares de cores simples)
┌───────────────────────┐              ┌──────────────────────────────┐
│ Core 0    Core 1      │              │ ┌──┐┌──┐┌──┐┌──┐ ... ┌──┐  │
│ ┌──────┐  ┌──────┐    │              │ │SM││SM││SM││SM│     │SM│  │
│ │ ALU  │  │ ALU  │    │              │ └──┘└──┘└──┘└──┘     └──┘  │
│ │ ALU  │  │ ALU  │    │              │ Cada SM = 128 CUDA cores   │
│ │ FPU  │  │ FPU  │    │              │ Total: ~16.384 cores       │
│ │Branch│  │Branch│    │              │ (mas cada core é simples)  │
│ │Pred. │  │Pred. │    │              │                            │
│ │ L1$  │  │ L1$  │    │              │ ┌──────────────────────┐   │
│ └──────┘  └──────┘    │              │ │   Shared Memory      │   │
│    ┌──────────────┐   │              │ │   (por SM, ~64KB)    │   │
│    │  L3 Cache    │   │              │ └──────────────────────┘   │
│    │  (32 MB)     │   │              │ ┌──────────────────────┐   │
│    └──────────────┘   │              │ │   VRAM (GDDR6/HBM)  │   │
│ ~8-24 cores           │              │ │   12-80 GB           │   │
└───────────────────────┘              └──────────────────────────────┘

FLOPS típicos (FP32):
  CPU (i9-13900K):   ~1 TFLOPS
  GPU (RTX 4090):    ~83 TFLOPS  ← 83x mais para computação paralela</div>
<p>Antes da GPU, as CPUs já tinham <strong>SIMD (Single Instruction, Multiple Data)</strong> — instruções que operam em múltiplos dados com uma única instrução:</p>
<div class="code-block">Sem SIMD (escalar):             Com SIMD (SSE/AVX):

for (i=0; i&lt;4; i++)            __m128 a = _mm_load_ps(A);
  C[i] = A[i] + B[i];          __m128 b = _mm_load_ps(B);
// 4 instruções ADD              __m128 c = _mm_add_ps(a, b);
                                // 1 instrução = 4 ADDs

Extensões SIMD:
• SSE (128 bits = 4 floats)    — Intel Pentium III (1999)
• AVX2 (256 bits = 8 floats)   — Intel Haswell (2013)
• AVX-512 (512 bits = 16 floats) — Intel Skylake-X (2017)
• NEON (128 bits)              — ARM</div>
<ul><li><strong>Por que GPUs dominam IA:</strong> Treinamento de redes neurais é essencialmente multiplicação de matrizes gigantes (GEMM). Uma matriz 4096×4096 × 4096×4096 envolve ~137 bilhões de operações — perfeito para 16 mil cores simples fazendo multiply-add em paralelo.</li><li><strong>CUDA / ROCm / Metal:</strong> APIs que permitem programar a GPU para computação genérica (GPGPU). O código roda em <strong>warps</strong> de 32 threads que executam a <em>mesma instrução</em> simultaneamente (SIMT).</li><li><strong>Tensor Cores:</strong> Unidades especializadas em multiplicação de matrizes 4×4 em FP16/BF16, acelerando operações de deep learning em até 8x vs. CUDA cores normais.</li><li><strong>O gargalo:</strong> Mover dados entre RAM da CPU e VRAM da GPU via PCIe (~32 GB/s) é ordens de magnitude mais lento que o bandwidth interno da GPU (~1 TB/s em HBM3). Por isso frameworks como PyTorch tentam manter tensores na GPU o máximo possível.</li></ul>`;

const STEP_6 =
`<p>Cada processo acredita ter toda a memória do computador para si — um espaço de endereçamento <strong>contínuo e privado</strong> de 0 até 2⁴⁸ (256 TB no x86-64). Isso é uma ilusão criada pela <span class="highlight">Memória Virtual</span>, implementada em hardware pela <strong>MMU (Memory Management Unit)</strong> da CPU.</p>
<div class="code-block">Tradução de Endereço Virtual → Físico:

Processo A vê:     Endereço Virtual 0x00007FFF12340000
Processo B vê:     Endereço Virtual 0x00007FFF12340000
                          │
              ┌───────────┼───────────┐
              │     MMU / Page Table  │
              └───────────┼───────────┘
                    ┌─────┴──────┐
                    ▼            ▼
              RAM Física:   RAM Física:
              0x0003A000    0x00891000
              (A vê aqui)   (B vê aqui)

→ Mesmo endereço virtual, posições físicas DIFERENTES!
→ Processos isolados — A não pode acessar memória de B.</div>
<p>A memória é dividida em <strong>páginas</strong> (tipicamente <strong>4 KB</strong> = 4096 bytes). A <strong>Page Table</strong> é uma estrutura de dados mantida pelo SO que mapeia cada página virtual para uma página física (ou marca como "não presente").</p>
<div class="code-block">Page Table de 4 níveis (x86-64):

Endereço Virtual (48 bits usados):
┌───────┬───────┬───────┬───────┬──────────────┐
│ PML4  │ PDPT  │  PD   │  PT   │   Offset     │
│ 9 bits│ 9 bits│ 9 bits│ 9 bits│   12 bits    │
└───┬───┴───┬───┴───┬───┴───┬───┴──────┬───────┘
    │       │       │       │          │
    ▼       ▼       ▼       ▼          ▼
  PML4 → PDPT → Page Dir → Page Table → Página Física
  Entry   Entry   Entry     Entry       + Offset

Cada nível tem 512 entradas (2⁹) × 8 bytes = 4 KB por tabela
4 acessos à memória para cada tradução! (sem TLB)</div>
<p>Sem otimização, cada acesso à memória exigiria 4 acessos adicionais (um por nível da page table). A solução é o <strong>TLB (Translation Lookaside Buffer)</strong>:</p>
<ul><li><strong>TLB:</strong> Cache de hardware dentro da MMU que armazena as traduções recentes (virtual → físico). Tipicamente 64-1536 entradas. <strong>TLB Hit</strong> (~99% das vezes) = tradução em ~1 ciclo. <strong>TLB Miss</strong> = page table walk (4 acessos à memória, ~20-100 ciclos).</li><li><strong>Huge Pages:</strong> Páginas de 2 MB ou 1 GB em vez de 4 KB. Reduzem drasticamente o número de entradas TLB necessárias. Uma aplicação com 1 GB de working set precisa de 262.144 entradas com páginas de 4 KB, mas apenas 512 com páginas de 2 MB.</li><li><strong>Page Fault:</strong> Quando a CPU acessa uma página marcada como "não presente", gera uma exceção (trap). O SO pode: (1) trazer a página do swap (disco), (2) alocar uma nova página física (lazy allocation), ou (3) matar o processo (segmentation fault / acesso inválido).</li><li><strong>Copy-on-Write (CoW):</strong> Quando um processo faz <code>fork()</code>, o SO <em>não</em> copia toda a memória. Ambos os processos apontam para as mesmas páginas físicas (marcadas como read-only). Só quando um deles escreve, a página é copiada — economizando memória e tempo.</li><li><strong>mmap:</strong> Mapeia arquivos ou dispositivos diretamente no espaço de endereçamento virtual. O acesso ao "arquivo" vira um acesso à memória — o SO carrega as páginas sob demanda via page faults.</li></ul>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];
