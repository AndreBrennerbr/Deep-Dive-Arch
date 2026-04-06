const STEP_1 =
`<p>Um <strong>sistema distribuído</strong> é um conjunto de processos independentes que se comunicam por rede e coordenam ações para aparecer como um sistema único ao usuário. Mas redes falham, latência varia, e relógios divergem — tornando tudo fundamentalmente mais difícil que um sistema centralizado.</p>
<div class="code-block">As 8 Falácias da Computação Distribuída (Deutsch, 1994):

  1. A rede é confiável             ← pacotes se perdem
  2. A latência é zero               ← 0.5ms local, 150ms cross-continent
  3. A bandwidth é infinita          ← saturação causa drops
  4. A rede é segura                 ← man-in-the-middle, spoofing
  5. A topologia não muda            ← nós entram e saem
  6. Existe um administrador          ← múltiplas organizações
  7. O custo de transporte é zero     ← serialização, compressão
  8. A rede é homogênea              ← diferentes OS, hardware, protocolos

  Consequência: projetar para falhas parciais
  → qualquer mensagem pode se perder, duplicar, chegar fora de ordem
  → qualquer nó pode crashar a qualquer momento
  → timeout ≠ certeza de falha (pode ser lentidão)</div>
<p>O <span class="highlight">Teorema CAP</span> (Brewer, 2000) define os trade-offs fundamentais:</p>
<div class="code-block">CAP Theorem:

  Escolha 2 de 3 (durante partição de rede):

       Consistency (C)
       Todos os nós veem os
       mesmos dados ao mesmo tempo
           ╱           ╲
          ╱             ╲
  Availability (A) ── Partition Tolerance (P)
  Todo request recebe    O sistema continua
  resposta (não-erro)    funcionando apesar de
                          mensagens perdidas/atrasadas

  Na prática, P é obrigatório (redes falham).
  Escolha real: CP ou AP durante partição.

  CP (Consistency + Partition Tolerance):
  → Se rede particiona, recusa requests (indisponível)
  → ZooKeeper, etcd, Spanner, MongoDB (configurado)
  → Banco não pode mostrar saldo errado

  AP (Availability + Partition Tolerance):
  → Se rede particiona, aceita requests (pode divergir)
  → Cassandra, DynamoDB, DNS, Couchbase
  → Carrinho de compras: melhor funcionar com conflito
    do que ficar indisponível

  PACELC (extensão):
  → Se Partition: escolhe A ou C
  → Else (rede OK): escolhe Latency ou Consistency
  → DynamoDB: PA/EL (prioriza availability e latência)
  → Spanner: PC/EC (prioriza consistency sempre)</div>
<ul><li><strong>FLP Impossibility (1985):</strong> Em um sistema assíncrono com pelo menos 1 processo que pode falhar, é <em>impossível</em> garantir consenso determinístico. Implicação: todo protocolo de consenso prático (Paxos, Raft) usa timeouts (parcialmente síncrono) ou randomização para contornar FLP.</li><li><strong>Two Generals Problem:</strong> Dois generais precisam coordenar ataque, mas mensageiros podem ser capturados. Impossível garantir acordo com comunicação não-confiável. Análogo ao commit em 2 fases sobre rede instável.</li><li><strong>Byzantine Fault Tolerance:</strong> Nós podem agir de forma maliciosa (mentir, enviar dados diferentes para diferentes nós). BFT tolera até f nós maliciosos com 3f+1 nós totais. Usado em blockchains (PBFT, Tendermint). Sistemas normais assumem "crash-stop" (falha honesta).</li><li><strong>Modelo de Falhas:</strong> Crash-stop (nó para e não volta), crash-recovery (nó volta com estado persistido), omission (perde mensagens), Byzantine (comportamento arbitrário). Cada modelo exige protocolos diferentes.</li></ul>`;

const STEP_2 =
`<p>Em sistemas distribuídos, <strong>não existe relógio global</strong> — cada nó tem seu próprio clock, e eles divergem (clock drift). Relógios lógicos capturam a <span class="highlight">relação causal</span> entre eventos sem depender de tempo real.</p>
<div class="code-block">Problema do Relógio Físico:

  Nó A (relógio: 10:00:00.000)  Nó B (relógio: 10:00:00.050)
  │                              │
  │ write(x=1) @ 10:00:00.100   │
  │ ──────── mensagem ────────→ │
  │          (30ms latência)     │
  │                              │ recebe @ 10:00:00.080 (relógio B)
  │                              │ write(x=2) @ 10:00:00.090
  │                              │
  │ Pelo relógio local de B: write(x=2) é DEPOIS de receber x=1
  │ Mas pelo timestamp: 10:00:00.090 < 10:00:00.100
  │ → Ordem errada! x=2 parece ter acontecido ANTES de x=1
  │
  │ NTP sincroniza relógios, mas precisão é ~ms (não µs)
  │ Google TrueTime: GPS + relógios atômicos → precisão ~7µs</div>
<p><strong>Lamport Clocks</strong> (1978) — o conceito fundamental:</p>
<div class="code-block">Lamport Clock — contador lógico:

  Regras:
  1. Antes de cada evento local: L = L + 1
  2. Ao enviar mensagem: L = L + 1, anexa L à mensagem
  3. Ao receber mensagem com timestamp T: L = max(L, T) + 1

  Nó A (L=0)                    Nó B (L=0)
  │                              │
  │ e1: write(x=1)  L=1         │
  │ ──── msg (L=1) ──────────→ │
  │                              │ e2: recv  L=max(0,1)+1=2
  │                              │ e3: write(x=2)  L=3
  │                              │ ──── msg (L=3) ──→
  │ e4: recv  L=max(1,3)+1=4    │
  │                              │
  │ Propriedade: se a → b (a causou b), então L(a) < L(b)
  │ MAS: L(a) < L(b) NÃO implica a → b (podem ser concorrentes)
  │ Lamport Clock não detecta concorrência!</div>
<p><strong>Vector Clocks</strong> — detectam concorrência:</p>
<div class="code-block">Vector Clock — um contador por nó:

  Nó A: V=[A:0, B:0]            Nó B: V=[A:0, B:0]
  │                               │
  │ e1: V=[A:1, B:0]             │
  │ ──── msg V=[1,0] ─────────→ │
  │                               │ e2: recv V=[A:1, B:1]
  │ e3: V=[A:2, B:0]             │ e3: V=[A:1, B:2]
  │                               │
  │ e3_A=[2,0] vs e3_B=[1,2]:
  │   A:2>1 mas B:0<2 → CONCORRENTES! (nem a→b nem b→a)
  │
  │ Comparação:
  │   V1 ≤ V2  ⟺  ∀i: V1[i] ≤ V2[i]    (V1 causou V2)
  │   V1 ∥ V2  ⟺  ∃i,j: V1[i]>V2[i] ∧ V1[j]<V2[j]  (concorrentes)

  Problema: tamanho do vetor cresce com número de nós
  Solução: Dotted Version Vectors, Interval Tree Clocks</div>
<ul><li><strong>Hybrid Logical Clocks (HLC):</strong> Combina timestamp físico com contador lógico. Preserva causalidade como Lamport, mas o valor é próximo do tempo real. Usado no CockroachDB. Formato: (physical_time, logical_counter, node_id).</li><li><strong>Happens-Before (→):</strong> Relação definida por Lamport. a → b se: (1) a e b são no mesmo processo e a vem antes, (2) a é envio e b é recebimento da mesma mensagem, (3) existe c tal que a → c e c → b. Se nem a→b nem b→a, são <em>concorrentes</em> (a ∥ b).</li><li><strong>Google TrueTime:</strong> API do Spanner que retorna intervalo [earliest, latest] em vez de timestamp pontual. Commit waits até "latest" para garantir que a ordem global é consistente. Hardware dedicado (GPS + atomic clocks) em cada datacenter.</li></ul>`;

const STEP_3 =
`<p><strong>Consenso</strong> é o problema de fazer múltiplos nós concordarem em um valor, mesmo quando alguns falham. É a base de bancos distribuídos, configuration stores (etcd, ZooKeeper) e replicação de estado.</p>
<div class="code-block">O Problema do Consenso:

  Propriedades que devem ser garantidas:
  1. Agreement:  todos os nós corretos decidem o mesmo valor
  2. Validity:   o valor decidido foi proposto por algum nó
  3. Termination: todos os nós corretos eventualmente decidem
  4. Integrity:  cada nó decide no máximo uma vez

  Desafio: nós podem crashar, mensagens podem se perder
  → FLP: impossível em modelo totalmente assíncrono
  → Solução prática: modelo parcialmente síncrono (timeouts)</div>
<p><span class="highlight">Raft</span> (2014) — o protocolo de consenso projetado para ser compreensível:</p>
<div class="code-block">Raft — Visão Geral:

  3 papéis: Leader, Follower, Candidate

  ┌──────────────────────────────────────────┐
  │         Term 5 (época/mandato)            │
  │                                          │
  │    ┌────────┐                            │
  │    │ Leader │ ← recebe todos os writes   │
  │    │  (S1)  │                            │
  │    └───┬────┘                            │
  │        │ AppendEntries RPC               │
  │        ├────────────────┐                │
  │        ▼                ▼                │
  │  ┌──────────┐    ┌──────────┐            │
  │  │ Follower │    │ Follower │            │
  │  │   (S2)   │    │   (S3)   │            │
  │  └──────────┘    └──────────┘            │
  └──────────────────────────────────────────┘

  Replicação de Log:
  1. Cliente envia write para Leader
  2. Leader adiciona ao seu log
  3. Leader envia AppendEntries para todos Followers
  4. Followers adicionam ao seu log e respondem ACK
  5. Quando maioria (quorum) confirma → committed
  6. Leader aplica ao state machine e responde ao cliente

  Quorum: N/2 + 1 nós (3 de 5, 2 de 3)
  → Tolera f falhas com 2f+1 nós</div>
<div class="code-block">Leader Election em Raft:

  ┌──────────┐  timeout sem    ┌───────────┐
  │ Follower │ ─────────────→ │ Candidate │
  └──────────┘  heartbeat      └─────┬─────┘
       ▲                             │
       │ descobre leader             │ envia RequestVote
       │ com term maior              │ para todos os nós
       │                             ▼
       │                       ┌─────────────┐
       │                       │ Recebe votos │
       │                       └──────┬──────┘
       │                              │
       │     maioria votou?          │
       │    ┌────────┴────────┐      │
       │    │ Sim             │ Não  │
       │    ▼                 ▼      │
       │ ┌────────┐    Volta para    │
       └─│ Leader │    Follower      │
         └────────┘    ou retry      │

  Regras de eleição:
  → Cada nó vota em no máximo 1 candidato por term
  → Candidato vota em si mesmo
  → Candidato com log mais atualizado é preferido
  → Election timeout randomizado (150-300ms)
    para evitar split votes

  Heartbeats:
  → Leader envia AppendEntries vazio periodicamente
  → Followers resetam election timer ao receber
  → Se timer expira → nova eleição</div>
<ul><li><strong>Paxos (Lamport, 1989):</strong> O protocolo original de consenso. Mais geral que Raft, mas notoriamente difícil de entender e implementar. Multi-Paxos: otimiza para sequência de valores (log replication). Usado em Chubby (Google), mas a maioria dos novos sistemas prefere Raft.</li><li><strong>Split-Brain:</strong> Se a rede particiona e dois sub-grupos elegem líderes diferentes, dados podem divergir. Raft previne com quorum: um líder precisa de maioria, e duas maiorias sempre se intersectam → no máximo 1 líder por term.</li><li><strong>Log Compaction:</strong> O log cresce infinitamente. Snapshot periódico do state machine + descarte de entradas antigas. Novos nós recebem snapshot + entradas recentes em vez de todo o log histórico.</li><li><strong>Exemplos reais:</strong> etcd (Kubernetes), CockroachDB, TiKV usam Raft. ZooKeeper usa ZAB (similar). Consul usa Raft. MongoDB usa protocolo próprio baseado em Raft.</li></ul>`;

const STEP_4 =
`<p>Modelos de <strong>consistência</strong> definem as garantias que um sistema distribuído oferece sobre a ordem e visibilidade das operações. Vão de <span class="highlight">Linearizability</span> (forte, como um sistema single-node) até <span class="highlight">Eventual Consistency</span> (fraca, convergência eventual).</p>
<div class="code-block">Espectro de Consistência:

  Mais Forte ────────────────────────── Mais Fraco
  (mais lento)                          (mais rápido)

  ┌──────────────┐
  │Linearizable  │ "Como se fosse 1 nó"
  │              │ Toda operação parece instantânea
  │              │ em algum ponto entre início e fim
  │              │ Ex: Spanner, etcd
  ├──────────────┤
  │Sequential    │ Operações de cada cliente em ordem
  │Consistency   │ Mas clientes diferentes podem ver
  │              │ ordens diferentes
  ├──────────────┤
  │Causal        │ Preserva relação causal (happens-before)
  │Consistency   │ Operações concorrentes: qualquer ordem
  │              │ Ex: MongoDB (causal sessions)
  ├──────────────┤
  │Read-your-    │ Cliente vê seus próprios writes
  │writes        │ Mas pode não ver writes de outros
  ├──────────────┤
  │Eventual      │ "Eventualmente" todos veem o mesmo valor
  │Consistency   │ Sem garantia de quando
  │              │ Ex: DNS, Cassandra (configurado)
  └──────────────┘</div>
<p><strong>Quorum Systems</strong> — garantindo consistência via votação:</p>
<div class="code-block">Quorum Read/Write (Dynamo-style):

  N = número de réplicas (ex: 3)
  W = write quorum (ex: 2)
  R = read quorum (ex: 2)

  Write x=42 (W=2 de N=3):
  ┌────┐  ┌────┐  ┌────┐
  │ S1 │  │ S2 │  │ S3 │
  │x=42│  │x=42│  │x=37│  ← S3 não recebeu (write parcial)
  │ ✓  │  │ ✓  │  │    │
  └────┘  └────┘  └────┘

  Read x (R=2 de N=3):
  → Lê de 2 nós, pega o mais recente (por timestamp/version)
  → Se R + W > N, read e write quorums se intersectam
  → Garante que pelo menos 1 nó no read quorum tem o valor mais recente

  R=1, W=3: writes lentos, reads rápidos (otimiza leitura)
  R=3, W=1: writes rápidos, reads lentos (otimiza escrita)
  R=2, W=2: balanceado

  Sloppy Quorum (Dynamo): se nós do quorum estão down,
  usa outros nós temporariamente (hinted handoff)
  → Prioriza availability sobre consistency</div>
<p><span class="highlight">CRDTs</span> — Conflict-free Replicated Data Types:</p>
<div class="code-block">CRDT — Convergência sem coordenação:

  Ideia: projetar tipos de dados que SEMPRE convergem
  automaticamente quando réplicas sincronizam,
  independente da ordem das operações.

  G-Counter (Grow-only Counter):
  ┌─────────────────────────────┐
  │ Cada nó mantém seu contador │
  │                             │
  │  Nó A: {A:3, B:0, C:0} = 3 │
  │  Nó B: {A:0, B:5, C:0} = 5 │
  │  Nó C: {A:0, B:0, C:2} = 2 │
  │                             │
  │  Merge: max por entrada     │
  │  {A:3, B:5, C:2} = 10      │
  │                             │
  │  → Comutativo: merge(a,b) = merge(b,a)
  │  → Associativo: merge(merge(a,b),c) = merge(a,merge(b,c))
  │  → Idempotente: merge(a,a) = a
  └─────────────────────────────┘

  LWW-Register (Last-Writer-Wins):
  → Cada write tem timestamp
  → Merge: valor com maior timestamp vence
  → Simples mas pode perder dados silenciosamente

  OR-Set (Observed-Remove Set):
  → Cada add gera um ID único (tag)
  → Remove apaga apenas tags observadas
  → Adds concorrentes com removes: add vence
  → Usado em carrinho de compras, listas colaborativas</div>
<ul><li><strong>CRDTs na prática:</strong> Redis (CRDB), Riak (conjuntos, contadores), Automerge/Yjs (documentos colaborativos como Google Docs), Figma (design colaborativo). Trade-off: convergência garantida, mas operações limitadas ao que é representável como CRDT.</li><li><strong>Anti-Entropy:</strong> Protocolos de fundo (background) para sincronizar réplicas: gossip protocol (cada nó fala com vizinhos aleatórios), Merkle trees (identifica diferenças eficientemente — usado em Dynamo, Cassandra), read repair (corrige no read).</li><li><strong>Linearizability vs Serializability:</strong> Linearizability é sobre operações individuais em tempo real. Serializability é sobre transações (grupo de operações). Strict Serializability = Serializability + Linearizability (o padrão mais forte).</li></ul>`;

const STEP_5 =
`<p><strong>Particionamento (Sharding)</strong> divide dados entre múltiplos nós para escalar horizontalmente — cada nó armazena apenas um subconjunto dos dados. O desafio: distribuir uniformemente, permitir queries eficientes e rebalancear quando nós entram/saem.</p>
<div class="code-block">Estratégias de Particionamento:

  1. Range Partitioning:
  ┌──────────────────────────────────────────┐
  │  Partition 1  │  Partition 2  │  Part 3  │
  │   A — F       │   G — N       │  O — Z   │
  │  (Nó 1)       │  (Nó 2)       │ (Nó 3)   │
  └──────────────────────────────────────────┘
  → Range queries eficientes (todos "A-C" estão juntos)
  → Problema: hotspot se dados não são uniformes
    Ex: chaves por data → nó do "hoje" sobrecarregado
  → Usado por: HBase, Spanner, CockroachDB

  2. Hash Partitioning:
  partition = hash(key) % num_partitions

  hash("user_42")  = 0xA3F2... % 3 = 1 → Nó 1
  hash("user_100") = 0x1B8C... % 3 = 2 → Nó 2
  hash("user_7")   = 0x5D01... % 3 = 0 → Nó 0

  → Distribuição uniforme (hash é "aleatório")
  → Perde ordenação: range queries precisam hit TODOS os nós
  → Usado por: Cassandra (com token ring), DynamoDB</div>
<p><span class="highlight">Consistent Hashing</span> — rebalanceamento eficiente:</p>
<div class="code-block">Consistent Hashing:

  Problema com hash simples:
  → Antes: hash(key) % 3 → 3 nós
  → Depois: hash(key) % 4 → 4 nós
  → QUASE TODOS os dados mudam de nó! Rebalanceamento massivo.

  Consistent Hashing: anel de hash (0 a 2³²)

         0
      ╱     ╲
    Nó A     key₁ (hash=15)
   (h=10)      │
    │          │  key₁ → vai para Nó B
    │          │  (primeiro nó no sentido horário)
    │          ▼
    │       Nó B
    │      (h=30)
    │         │
    ▼         │
  key₂ ───→ Nó C
  (h=50)   (h=60)
         ╲     ╱
           90

  Adicionar Nó D (h=45):
  → Apenas keys entre Nó A (10) e Nó D (45) mudam
  → ~1/N dos dados migram (em vez de quase todos)

  Virtual Nodes (vnodes):
  → Cada nó físico tem ~100-200 posições no anel
  → Distribuição mais uniforme
  → Nó com mais capacidade → mais vnodes
  → Usado por: Cassandra, DynamoDB, Riak</div>
<div class="code-block">Problemas e Soluções de Particionamento:

  Hotspot / Skew:
  → Chave popular (celebridade): todas requests no mesmo nó
  → Solução: append random suffix (key_001, key_002...)
    → espalha em N nós, mas reads precisam agregar
  → Instagram: salting de chaves de celebridades

  Secondary Indexes:
  Local index (document-partitioned):
  → Cada partição indexa SÓ seus dados
  → Write rápido (atualiza 1 índice)
  → Query no índice: scatter-gather (hit todos os nós)

  Global index (term-partitioned):
  → Índice particionado por termo, não por documento
  → Query rápida (1-2 partições do índice)
  → Write lento (pode precisar atualizar múltiplas partições)

  Cross-partition Queries:
  → JOIN distribuído: shuffle data entre nós (caro)
  → Desnormalização: duplicar dados para evitar joins
  → Co-locate: particionar tabelas relacionadas pela mesma key</div>
<ul><li><strong>Rebalanceamento:</strong> Quando nós entram/saem, dados precisam migrar. Estratégias: fixed number of partitions (criar muitas partições antecipadamente e mover partições inteiras), dynamic partitioning (split/merge quando partição fica grande/pequena — HBase), proportional to nodes (Cassandra vnodes).</li><li><strong>Request Routing:</strong> Como o cliente sabe qual nó tem seu dado? (1) Qualquer nó (gossip protocol — Cassandra), (2) Routing tier separado (ZooKeeper — HBase, Kafka), (3) Client-aware (driver conhece o mapeamento — MongoDB).</li><li><strong>Multi-Region:</strong> Particionar por geografia — dados perto do usuário. Spanner: continent-level partitioning. CockroachDB: rack/region/zone awareness. Trade-off: latência vs consistency cross-region.</li></ul>`;

const STEP_6 =
`<p>Os conceitos teóricos ganham vida em sistemas reais que fazem trade-offs específicos para seus use cases. Estudar essas arquiteturas revela como teoria vira engenharia na prática.</p>
<div class="code-block">Apache Kafka — Distributed Event Log:

  ┌────────────────────────────────────┐
  │ Topic: "orders"                     │
  │                                    │
  │  Partition 0    Partition 1    Partition 2
  │  [0|1|2|3|4]   [0|1|2|3]     [0|1|2|3|4|5]
  │   (Broker 1)    (Broker 2)    (Broker 3)
  │                                    │
  │  Producer → hash(order_id) → partition
  │  Consumer Group: cada consumer lê partições exclusivas
  │                                    │
  │  Replicação:
  │  P0: Leader=B1, Followers=B2,B3   │
  │  P1: Leader=B2, Followers=B1,B3   │
  │  ISR (In-Sync Replicas): followers up-to-date
  │                                    │
  │  acks=0: fire-and-forget (rápido, pode perder)
  │  acks=1: leader confirma (balanceado)
  │  acks=all: todas ISR confirmam (durável)
  └────────────────────────────────────┘

  → Append-only log: writes são O(1) sequential I/O
  → Retenção por tempo/tamanho (não deleta após consumir)
  → Compaction: mantém apenas último valor por key
  → Throughput: milhões de msgs/sec por cluster</div>
<div class="code-block">Google Spanner — Globally Distributed SQL:

  ┌──────────────────────────────────────────┐
  │ Spanner: banco relacional distribuído    │
  │ globalmente com transações ACID          │
  │                                          │
  │ Como funciona:                           │
  │ 1. TrueTime API: [earliest, latest]      │
  │    GPS + atomic clocks em cada datacenter│
  │    Incerteza: ε ≈ 7µs (tipicamente)     │
  │                                          │
  │ 2. Commit Wait:                          │
  │    Após commit, espera ε tempo            │
  │    → Garante que commit timestamp é       │
  │      definitivamente no passado           │
  │    → Leituras em qualquer datacenter      │
  │      veem todos os commits anteriores     │
  │                                          │
  │ 3. Paxos groups por partition             │
  │    → Consensus para cada write            │
  │    → Leader por partition, multi-region   │
  │                                          │
  │ 4. 2PC para transações cross-partition    │
  │    → Coordinator usa Paxos group          │
  │    → Tolerante a falhas (não bloqueia)    │
  │                                          │
  │ Trade-off: latência de write (~14ms same  │
  │ region, ~100ms cross-continent) em troca  │
  │ de consistência forte global              │
  └──────────────────────────────────────────┘</div>
<div class="code-block">Amazon Dynamo (2007) — AP System:

  ┌──────────────────────────────────────┐
  │ Dynamo: key-value store, always-on    │
  │                                      │
  │ Princípios:                           │
  │ → Availability > Consistency          │
  │ → "Always writeable"                  │
  │ → Eventual consistency               │
  │                                      │
  │ Técnicas combinadas:                  │
  │ 1. Consistent Hashing + vnodes       │
  │ 2. Quorum (N,R,W) configurável       │
  │ 3. Vector Clocks para versionamento  │
  │ 4. Sloppy Quorum + Hinted Handoff    │
  │ 5. Merkle Trees para anti-entropy    │
  │ 6. Gossip Protocol para membership   │
  │                                      │
  │ Conflito: 2 writes concorrentes      │
  │ → Vector clock detecta divergência   │
  │ → Aplicação resolve (ex: merge       │
  │   carrinhos de compras = união)      │
  │                                      │
  │ Influenciou: Cassandra, Riak,         │
  │ DynamoDB, Voldemort                   │
  └──────────────────────────────────────┘</div>
<ul><li><strong>MapReduce / Spark:</strong> Paradigma de processamento distribuído. Map: processa dados em paralelo (cada nó processa sua partição). Shuffle: redistribui dados por chave entre nós. Reduce: agrega resultados. Spark melhora com DAG de operações in-memory (10-100x mais rápido que MapReduce on disk).</li><li><strong>Raft in etcd (Kubernetes):</strong> etcd armazena todo o estado do cluster Kubernetes. Raft garante que todos os nós etcd concordam no estado. Leader aceita writes, replica para followers. Watch API: clientes recebem notificações de mudanças em tempo real.</li><li><strong>Jepsen Testing:</strong> Framework de teste que injeta falhas de rede (partitions, packet loss, clock skew) em bancos distribuídos e verifica se as garantias de consistência são mantidas. Descobriu bugs em Redis, MongoDB, Cassandra, CockroachDB, etc. Fundamental para validar claims de consistency.</li></ul>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];
