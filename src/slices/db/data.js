import { STEPS_CONTENT } from './content.js';

export const MOD_DB = {
  id: 'db',
  title: 'Banco de Dados Internals',
  steps: [
    {
      short: '1. Storage Engine',
      title: '💾 Storage Engine: B-Trees e LSM-Trees',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'B-Tree (Wikipedia)', url: 'https://en.wikipedia.org/wiki/B-tree'},
        {text: 'LSM-Tree Paper (O\'Neil 1996)', url: 'https://www.cs.umb.edu/~poneil/lsmtree.pdf'},
        {text: 'RocksDB Wiki', url: 'https://github.com/facebook/rocksdb/wiki'}
      ]
    },
    {
      short: '2. Indexação',
      title: '📇 Índices: B+Tree, Hash e Além',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'PostgreSQL Indexes', url: 'https://www.postgresql.org/docs/current/indexes.html'},
        {text: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/'},
        {text: 'B+Tree (Wikipedia)', url: 'https://en.wikipedia.org/wiki/B%2B_tree'}
      ]
    },
    {
      short: '3. Query Processing',
      title: '🔍 Query Processing: Do SQL ao Execution Plan',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'PostgreSQL Query Planning', url: 'https://www.postgresql.org/docs/current/planner-optimizer.html'},
        {text: 'How Query Engines Work (Andy Pavlo)', url: 'https://15445.courses.cs.cmu.edu/fall2023/'},
        {text: 'EXPLAIN docs', url: 'https://www.postgresql.org/docs/current/sql-explain.html'}
      ]
    },
    {
      short: '4. Transações & ACID',
      title: '🔒 Transações: ACID, WAL e MVCC',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'PostgreSQL MVCC', url: 'https://www.postgresql.org/docs/current/mvcc.html'},
        {text: 'WAL (PostgreSQL)', url: 'https://www.postgresql.org/docs/current/wal.html'},
        {text: 'Transaction Isolation (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Isolation_(database_systems)'}
      ]
    },
    {
      short: '5. Buffer Pool & Cache',
      title: '🧊 Buffer Pool: RAM como Cache do Disco',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'PostgreSQL Buffer Manager', url: 'https://www.interdb.jp/pg/pgsql08.html'},
        {text: 'Buffer Pool (CMU 15-445)', url: 'https://15445.courses.cs.cmu.edu/fall2023/notes/05-bufferpool.pdf'},
        {text: 'Clock Algorithm (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Page_replacement_algorithm#Clock'}
      ]
    },
    {
      short: '6. Replicação & Recovery',
      title: '🔄 Replicação: Alta Disponibilidade e Recovery',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'PostgreSQL Streaming Replication', url: 'https://www.postgresql.org/docs/current/warm-standby.html'},
        {text: 'PITR (PostgreSQL)', url: 'https://www.postgresql.org/docs/current/continuous-archiving.html'},
        {text: 'Patroni (GitHub)', url: 'https://github.com/patroni/patroni'}
      ]
    }
  ]
};
