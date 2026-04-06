const STEP_1 =
`<p>No coração de todo banco de dados está a <strong>Storage Engine</strong> — o componente que decide <em>como</em> dados são fisicamente escritos e lidos do disco. As duas arquiteturas dominantes são <span class="highlight">B-Trees</span> (otimizada para leitura) e <span class="highlight">LSM-Trees</span> (otimizada para escrita).</p>
<div class="code-block">B-Tree — Estrutura em disco (PostgreSQL, MySQL InnoDB):

Cada nó é uma PÁGINA de disco (tipicamente 8 KB / 16 KB).

              ┌───────────────────────┐
              │  [30 | 70]            │   Página raiz
              │  P0   P1   P2        │   (3 ponteiros)
              └──┬────┬────┬─────────┘
          ┌──────┘    │    └──────┐
          ▼           ▼          ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │[10|20]   │ │[40|50|60]│ │[80|90]   │   Páginas internas
   │P0 P1 P2  │ │P0 P1 P2 P3│ │P0 P1 P2  │
   └──┬─┬──┬──┘ └┬──┬──┬──┬┘ └──┬──┬──┬─┘
      ▼ ▼  ▼     ▼  ▼  ▼  ▼     ▼  ▼  ▼
   [páginas folha com dados reais (tuples/rows)]

Propriedades:
• Balanceada: todas as folhas na mesma profundidade
• Fan-out alto: ~500 chaves por página (8KB/16B por chave)
• 3 níveis → 500³ = 125 milhões de chaves com 3 disk seeks
• Busca: O(log_B n) onde B = fan-out</div>
<p>O <strong>B+Tree</strong> (variante usada na prática) armazena dados <em>apenas nas folhas</em>, com as folhas conectadas em lista ligada para range scans eficientes.</p>
<div class="code-block">LSM-Tree — Log-Structured Merge-Tree (RocksDB, Cassandra, LevelDB):

  Write Path:
  ┌──────────┐    ┌──────────────┐    ┌─────────────────┐
  │  Write   │───→│  MemTable    │───→│  WAL (disco)    │
  │  (PUT k) │    │  (Red-Black  │    │  (append-only   │
  │          │    │   Tree, RAM) │    │   para durabil.) │
  └──────────┘    └──────┬───────┘    └─────────────────┘
                         │ flush quando cheia (~64MB)
                         ▼
                  ┌──────────────┐
                  │  SSTable L0  │  Sorted String Table
                  └──────┬───────┘  (imutável no disco)
                         │ compaction
                  ┌──────┴───────┐
                  │  SSTable L1  │  Merge-sort de SSTables
                  └──────┬───────┘  (remove duplicatas/tombstones)
                         │
                  ┌──────┴───────┐
                  │  SSTable L2  │  Cada nível ~10x maior
                  └──────────────┘

  Read Path:
  MemTable → L0 → L1 → L2 → ... (parar no primeiro match)
  Otimização: Bloom Filter por SSTable (evita disk seeks inúteis)</div>
<ul><li><strong>B-Tree vs LSM-Tree:</strong> B-Trees têm read amplification baixa (1 seek por nível) mas write amplification alta (reescreve página inteira para mudar 1 byte). LSM-Trees invertem: escrita é append-only (rápida), mas leitura pode precisar verificar múltiplos níveis.</li><li><strong>Write Amplification:</strong> Em LSM, cada dado é escrito múltiplas vezes durante compaction (~10-30x). Em B-Trees, ~2-3x (WAL + página). Isso importa para SSDs com ciclos de escrita limitados.</li><li><strong>Páginas:</strong> Unidade fundamental de I/O — o disco lê/escreve em blocos de 4KB (SSD) ou 8KB (PostgreSQL page). Toda estrutura de dados em disco é projetada em torno de páginas: B-Tree nodes, heap tuples, índices.</li><li><strong>Heap vs Clustered:</strong> No PostgreSQL, a tabela é um <em>heap</em> (linhas em ordem de inserção), e o B-Tree index aponta para o heap. No InnoDB (MySQL), o primary key IS a B-Tree (clustered index) — dados armazenados nas folhas, ordenados pela PK.</li></ul>`;

const STEP_2 =
`<p>Um <strong>índice</strong> é uma estrutura de dados separada que mantém uma cópia ordenada de uma ou mais colunas, com ponteiros para as linhas originais na tabela (heap). Sem índice, toda query requer um <em>sequential scan</em> — ler a tabela inteira.</p>
<div class="code-block">B+Tree Index (o padrão):

CREATE INDEX idx_email ON users(email);

  B+Tree no disco:
  ┌──────────────────────────────┐
  │  [garcia@ | maria@ | zoe@]  │  Nó interno
  └───┬──────┬──────┬───────────┘
      ▼      ▼      ▼
  ┌────────┐┌────────┐┌────────┐
  │alice@  ││garcia@ ││maria@  │  Folhas
  │→heap:42││→heap:7 ││→heap:99│  (email → ponteiro para heap)
  │bob@    ││jose@   ││pedro@  │
  │→heap:15││→heap:23││→heap:56│
  │carlos@ ││lara@   ││zoe@    │
  │→heap:88││→heap:31││→heap:3 │
  └──┬─────┘└──┬─────┘└────────┘
     └────→────┘  Lista ligada para range scans

SELECT * FROM users WHERE email = 'jose@...';
→ 3 page reads (raiz → interno → folha) → heap lookup
→ vs. 100.000 page reads sem índice (seq scan)</div>
<p>Tipos de índice:</p>
<div class="code-block">Hash Index:
  hash(key) → bucket → ponteiro heap
  → O(1) para equality (WHERE x = 42)
  → NÃO suporta range queries (WHERE x > 10)
  → PostgreSQL: pouco usado (crash-unsafe até v10)

Composite Index (multi-column):
  CREATE INDEX idx ON orders(user_id, created_at);
  → B+Tree ordenada por (user_id, created_at)
  → Útil para: WHERE user_id = 5 AND created_at > '2026-01-01'
  → Segue "leftmost prefix": pode buscar por user_id sozinho,
    mas NÃO por created_at sozinho

Covering Index (Index-Only Scan):
  CREATE INDEX idx ON orders(user_id) INCLUDE (total);
  → Folhas contêm user_id + total
  → SELECT total FROM orders WHERE user_id = 5
  → Resposta direto do índice, sem ir ao heap!

Partial Index:
  CREATE INDEX idx ON orders(status) WHERE status = 'pending';
  → Indexa apenas linhas pendentes (~1% da tabela)
  → Índice minúsculo, super rápido</div>
<ul><li><strong>GIN (Generalized Inverted Index):</strong> Para arrays, JSONB e full-text search. Mapeia cada <em>elemento</em> para as linhas que o contêm. Ex: buscar documentos que contenham a palavra "kernel" — o GIN aponta diretamente para as linhas relevantes.</li><li><strong>GiST (Generalized Search Tree):</strong> Para dados geográficos (PostGIS), ranges e tipos customizados. Suporta operações como "encontre todos os pontos dentro deste polígono" via R-Trees.</li><li><strong>BRIN (Block Range Index):</strong> Índice minimalista — armazena min/max por bloco de páginas. Perfeito para tabelas com dados naturalmente ordenados (timestamps). Tamanho: ~0.01% da tabela.</li><li><strong>Trade-off:</strong> Todo índice acelera leitura mas desacelera escrita (precisa atualizar o índice a cada INSERT/UPDATE/DELETE). Cada índice consome espaço em disco e RAM. O query planner decide se vale usar o índice ou fazer seq scan.</li></ul>`;

const STEP_3 =
`<p>Quando você envia <code>SELECT * FROM users WHERE age > 25 ORDER BY name</code>, o banco de dados executa um pipeline sofisticado que transforma texto SQL em um plano de execução otimizado:</p>
<div class="code-block">Pipeline de Query Processing:

  SQL Text
    │
    ▼
  ┌──────────────┐
  │   Parser     │  Análise léxica + sintática
  │              │  SQL → Parse Tree (AST)
  │              │  Detecta erros de sintaxe
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │   Analyzer   │  Resolução de nomes (tabelas, colunas existem?)
  │  (Semantic)  │  Verificação de tipos
  │              │  Resolução de permissões
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │   Rewriter   │  Expande views e regras
  │              │  Transforma subqueries
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │   Planner /  │  Gera planos candidatos
  │   Optimizer  │  Estima custo de cada plano
  │   (CBO)      │  Escolhe o mais barato
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │   Executor   │  Executa o plano nó-a-nó
  │  (Volcano)   │  Modelo pull: cada nó pede linhas ao filho
  └──────────────┘</div>
<p>O <strong>Query Optimizer</strong> é o componente mais complexo. Usa <span class="highlight">Cost-Based Optimization (CBO)</span> — estima o custo (I/O + CPU) de diferentes planos e escolhe o mais barato:</p>
<div class="code-block">EXPLAIN ANALYZE SELECT * FROM orders
  JOIN users ON orders.user_id = users.id
  WHERE users.country = 'BR'
  ORDER BY orders.created_at;

Plano escolhido pelo optimizer:

  Sort (cost=2341..2356 rows=1200)
    Sort Key: orders.created_at
    │
    └─ Hash Join (cost=125..2341 rows=1200)
         Hash Cond: orders.user_id = users.id
         │
         ├─ Seq Scan on orders (cost=0..1500 rows=50000)
         │    → Tabela grande, sem filtro → seq scan
         │
         └─ Hash (cost=100..100 rows=300)
              └─ Index Scan on idx_users_country (cost=0..100 rows=300)
                   Filter: country = 'BR'
                   → Seletividade alta (~0.6%) → usa índice

Estatísticas usadas pelo CBO:
• pg_stats: histogramas de valores, null_frac, n_distinct
• Seletividade: % de linhas que passam um filtro
• Correlação: grau de ordenação física dos dados
• ANALYZE atualiza estas estatísticas</div>
<ul><li><strong>Join Algorithms</strong> — o optimizer escolhe baseado em cardinalidade estimada:</li></ul>
<div class="code-block">Nested Loop Join: O(n × m)
  for each row r in outer:
    for each row s in inner:
      if r.key == s.key → emit(r, s)
  → Index Nested Loop: inner lookup via B-Tree → O(n × log m)
  → Bom quando inner é pequena ou tem índice

Hash Join: O(n + m)  — mais comum para equi-joins
  Build:  constrói hash table da tabela menor
  Probe:  scan da tabela maior, lookup no hash
  → Se hash table não cabe em work_mem:
    Grace Hash Join → particiona ambas em disco

Merge Join: O(n log n + m log m)
  Requer ambas as entradas ORDENADAS pela join key
  Dois ponteiros avançam em paralelo (merge)
  → Se já ordenadas (via índice): O(n + m) — o mais rápido!
  → Ideal para range joins e colunas indexadas</div>
<ul><li><strong>Volcano Model:</strong> Cada operador (scan, filter, join, sort) é um iterador com <code>open()</code>, <code>next()</code>, <code>close()</code>. O nó raiz chama <code>next()</code> no filho, que chama no seu filho, etc. Dados fluem de baixo para cima, uma tupla por vez.</li><li><strong>Prepared Statements:</strong> Parse + Plan uma vez, execute muitas vezes com parâmetros diferentes. Evita re-planejamento, mas o plano pode ser subótimo para distribuições de dados desiguais (generic vs custom plan no PostgreSQL).</li><li><strong>Materialized Views:</strong> Query pré-computada e armazenada como tabela. <code>REFRESH MATERIALIZED VIEW</code> recomputa. Útil para dashboards e agregações pesadas.</li></ul>`;

const STEP_4 =
`<p>Uma <strong>transação</strong> é uma unidade atômica de trabalho — ou todas as operações acontecem, ou nenhuma. As propriedades <span class="highlight">ACID</span> são a garantia fundamental de bancos relacionais:</p>
<div class="code-block">ACID:

A — Atomicity (Atomicidade)
  → Tudo ou nada. Se uma query falha, todo o trabalho
    da transação é desfeito (ROLLBACK).
  → Implementado via WAL (Write-Ahead Log):
    antes de modificar dados, escreve a intenção no log.
    Crash? Replay/undo do log na recuperação.

C — Consistency (Consistência)
  → O banco vai de um estado válido para outro.
  → Constraints (PK, FK, CHECK, UNIQUE) verificadas no COMMIT.
  → Violação → ROLLBACK automático.

I — Isolation (Isolamento)
  → Transações concorrentes não interferem entre si.
  → Cada transação vê um "snapshot" consistente do banco.
  → Implementado via MVCC ou Locks.

D — Durability (Durabilidade)
  → Após COMMIT, dados sobrevivem a crash/power loss.
  → WAL escrito em disco com fsync() antes do COMMIT retornar.
  → Mesmo que dados em buffer pool não tenham sido flushed.</div>
<p><strong>WAL (Write-Ahead Logging)</strong> — a espinha dorsal da durabilidade:</p>
<div class="code-block">Write-Ahead Log:

  UPDATE accounts SET balance = 900 WHERE id = 1;
  UPDATE accounts SET balance = 1100 WHERE id = 2;
  COMMIT;

  Sequência real:
  1. Escreve no WAL: "txn 42: set page 5 offset 12: 1000→900"
  2. Escreve no WAL: "txn 42: set page 8 offset 44: 1000→1100"
  3. Escreve no WAL: "txn 42: COMMIT"
  4. fsync(WAL)  ← AGORA está durável
  5. Modifica páginas no buffer pool (memória)
  6. Eventualmente, checkpoint flushes dirty pages para disco

  Crash entre 4 e 6? → Recovery lê o WAL e re-aplica
  Crash antes de 4?  → Transação nunca commitou → ignorada

  Estrutura de um WAL Record (PostgreSQL):
  ┌──────┬──────┬────────┬─────────┬──────────────────┐
  │ LSN  │ TxID │ Type   │ Page ID │ Before/After Img │
  │ (8B) │ (4B) │ INSERT │ (4B)    │ (tuple data)     │
  │      │      │ UPDATE │         │ old → new        │
  │      │      │ COMMIT │         │                  │
  └──────┴──────┴────────┴─────────┴──────────────────┘
  LSN = Log Sequence Number (posição monotônica crescente)
  full_page_writes: após checkpoint, grava página inteira
    → protege contra torn pages (crash durante write parcial)</div>
<p><strong>MVCC (Multi-Version Concurrency Control)</strong> — leitores nunca bloqueiam escritores:</p>
<div class="code-block">MVCC no PostgreSQL:

  Cada tupla tem: xmin (txn que criou) e xmax (txn que deletou)

  Txn 100: INSERT INTO users VALUES (1, 'Alice');
  → Tupla: {xmin=100, xmax=∞, data=(1,'Alice')}

  Txn 200: UPDATE users SET name='Bob' WHERE id=1;
  → Tupla antiga: {xmin=100, xmax=200, data=(1,'Alice')}  ← marcada morta
  → Tupla nova:   {xmin=200, xmax=∞,   data=(1,'Bob')}    ← versão nova

  Txn 150 (iniciada antes de 200, ainda rodando):
  → Vê a tupla com xmin=100 (a versão 'Alice')
  → NÃO vê xmin=200 (versão 'Bob') — txn 200 não existia quando 150 começou

  → VACUUM remove tuplas mortas que nenhuma txn precisa mais</div>
<ul><li><strong>Isolation Levels:</strong> Read Uncommitted (vê dirty reads — quase nunca usado), Read Committed (PostgreSQL default — cada query vê o snapshot mais recente), Repeatable Read (snapshot fixo no BEGIN), Serializable (equivalente a execução serial — usa SSI em PostgreSQL para detectar anomalias).</li><li><strong>Write Skew:</strong> Anomalia em Repeatable Read — duas transações leem o mesmo dado, fazem decisões baseadas nele e escrevem em linhas diferentes. Ambas commitam, mas o resultado viola uma constraint de negócio. Serializable previne isso.</li><li><strong>Deadlock Detection:</strong> O banco mantém um grafo de espera (wait-for graph). Se detecta um ciclo, aborta a transação com menor custo.</li><li><strong>Two-Phase Commit (2PC):</strong> Para transações distribuídas — coordinator pergunta a todos os participantes "pronto para commit?", e só comita se todos dizem sim. Bloqueante se o coordinator crashar.</li></ul>`;

const STEP_5 =
`<p>O banco de dados não lê/escreve diretamente do disco — toda operação passa pelo <strong>Buffer Pool</strong>, um cache de páginas em memória RAM. O objetivo é minimizar I/O de disco, que é ordens de magnitude mais lento que RAM.</p>
<div class="code-block">Buffer Pool Manager:

  ┌─────────────────────────────────────────────┐
  │              Buffer Pool (RAM)              │
  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
  │  │Page 5│ │Page 12│ │Page 3│ │Page 42│      │
  │  │dirty ✓│ │clean  │ │dirty ✓│ │clean  │     │
  │  │pin: 2 │ │pin: 0 │ │pin: 1 │ │pin: 0 │    │
  │  └──────┘ └──────┘ └──────┘ └──────┘       │
  │                                             │
  │  Page Table (hash map): page_id → frame_id  │
  │  Free List: [frame 5, frame 9, ...]         │
  └─────────────────────┬───────────────────────┘
                        │
                        │ evict / flush
                        ▼
  ┌─────────────────────────────────────────────┐
  │              Disco (SSD/HDD)                │
  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
  │  │ P0 │ │ P1 │ │ P2 │ │ P3 │ │... │        │
  │  └────┘ └────┘ └────┘ └────┘ └────┘        │
  └─────────────────────────────────────────────┘</div>
<p>Quando o buffer pool está cheio e uma nova página é necessária, o banco precisa <strong>evictar</strong> uma página existente. A política de evição determina qual página sai:</p>
<div class="code-block">Políticas de Evição:

  LRU (Least Recently Used):
  → Evicta a página acessada há mais tempo
  → Problema: Sequential Flooding — um seq scan
    polui todo o cache com páginas que não serão reusadas

  Clock (Second Chance):
  → Variante eficiente do LRU com ponteiro circular
  → Cada página tem bit de referência
  → Ponteiro gira: se bit=1, seta 0 e pula; se bit=0, evicta
  → PostgreSQL usa Clock-Sweep

  LRU-K (usado no SQL Server):
  → Rastreia as últimas K referências de cada página
  → Evicta baseado na K-ésima referência mais antiga
  → Resiste melhor a sequential flooding

  Buffer Pool no PostgreSQL:
  → shared_buffers: tipicamente 25% da RAM (ex: 4GB de 16GB)
  → effective_cache_size: hint para o planner incluir OS page cache
  → Ring Buffer: scans grandes usam buffer circular pequeno
    para não poluir o shared_buffers</div>
<ul><li><strong>Dirty Pages:</strong> Páginas modificadas no buffer pool que ainda não foram escritas no disco. O <strong>Background Writer</strong> periodicamente flushes dirty pages para disco. O <strong>Checkpoint</strong> força flush de TODAS as dirty pages — cria um ponto de recuperação consistente.</li><li><strong>Pin Count:</strong> Página "pinned" não pode ser evictada (está em uso por uma query). Pin count > 0 = protegida. Quando a query termina, faz unpin.</li><li><strong>Double Buffering:</strong> O OS também tem seu page cache. Ler a mesma página pode estar cacheada em 2 lugares (buffer pool + OS cache). PostgreSQL usa <code>O_DIRECT</code> opcionalmente para evitar isso. InnoDB usa <code>O_DIRECT</code> por padrão.</li><li><strong>Prefetching:</strong> Para seq scans, o banco pode pedir páginas adiantadas ao OS (readahead) antes de precisar delas. Reduz latência percebida ao sobrepor I/O com processamento.</li></ul>`;

const STEP_6 =
`<p>Em produção, um banco de dados nunca roda sozinho. A <strong>replicação</strong> cria cópias do banco em múltiplos servidores para alta disponibilidade (failover automático), distribuição de leitura (read replicas) e disaster recovery.</p>
<div class="code-block">Replicação no PostgreSQL (Streaming Replication):

  Primary (read/write)          Standby (read-only)
  ┌──────────────────┐          ┌──────────────────┐
  │  App escreve aqui│          │  Réplica hot     │
  │                  │          │  standby         │
  │  ┌─────────────┐ │  WAL     │  ┌─────────────┐ │
  │  │ WAL Writer  │─┼──stream──┼─→│ WAL Receiver│ │
  │  └─────────────┘ │  contínuo│  └──────┬──────┘ │
  │  ┌─────────────┐ │          │  ┌──────┴──────┐ │
  │  │   Data      │ │          │  │  Startup    │ │
  │  │   Files     │ │          │  │  Process    │ │
  │  └─────────────┘ │          │  │  (replay)   │ │
  └──────────────────┘          │  └─────────────┘ │
                                └──────────────────┘

  Modos:
  • Async: Primary não espera standby confirmar
    → Menor latência, risco de perda de dados (lag)
  • Sync:  Primary espera ≥1 standby confirmar
    → Zero data loss, maior latência de commit
  • Quorum: N de M standbys confirmam (flexível)</div>
<p><strong>Recovery</strong> — o que acontece após um crash:</p>
<div class="code-block">Crash Recovery (WAL Replay):

  1. Banco detecta shutdown não-limpo (pg_control)
  2. Encontra o último checkpoint no WAL
  3. A partir do checkpoint, REDO:
     → Lê cada WAL record sequencialmente
     → Re-aplica todas as mudanças nas data pages
     → Inclui transações commitadas E não-commitadas
  4. Após redo, UNDO (se necessário):
     → Transações não-commitadas são rolled back
  5. Banco está consistente — pronto para aceitar conexões

  Point-in-Time Recovery (PITR):
  → Backup base + WAL arquivados = restaurar para qualquer
    momento no tempo
  → "Restaure o banco para 14:30 de ontem"
  → pg_basebackup + archive_command + recovery_target_time</div>
<ul><li><strong>Logical Replication:</strong> Em vez de replicar WAL (byte a byte), replica as mudanças em nível lógico (INSERT/UPDATE/DELETE). Permite replicação seletiva (apenas certas tabelas), replicação entre versões diferentes, e transformações durante a replicação.</li><li><strong>Failover:</strong> Se o primary cai, o standby é promovido a primary (pg_promote). Tools como Patroni automatizam: monitoram health, gerenciam leader election (via etcd/ZooKeeper), e fazem failover automático em segundos.</li><li><strong>Connection Pooling (PgBouncer):</strong> O PostgreSQL faz fork() por conexão (~5MB/conn). Com 1000 conexões = 5GB só de overhead. PgBouncer multiplexa 1000 conexões de aplicação em ~50 conexões reais ao banco.</li><li><strong>Vacuum:</strong> MVCC acumula versões mortas de tuplas. VACUUM limpa: marca espaço como reutilizável. VACUUM FULL compacta fisicamente (lock exclusivo). Autovacuum roda em background, mas precisa de tuning para tabelas com alto write throughput.</li></ul>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];
