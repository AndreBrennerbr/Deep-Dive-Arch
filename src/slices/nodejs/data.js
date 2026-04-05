export const MOD_NODEJS = {
  id: 'node',
  title: 'Node.js & Eng. Reversa HTTP',
  steps: [
    {
      short: '1. socket() e bind()',
      title: '🔧 Socket e Bind',
      content: '<p>Quando seu script diz <code>app.listen(3000)</code>, o Engine V8 passa para o <strong>TCPWrap</strong> (módulo C++ atrelado na <code>libuv</code>).</p><p>O C++ invoca <code>socket(AF_INET, SOCK_STREAM, 0)</code> do Linux recebendo um File Descriptor (fd=3). Em seguida chama <code>bind()</code> na placa especificada e <code>listen(backlog)</code> para configurar a fila do kernel (o tamanho do pipeline de pedidos não processados).</p><div class="code-block">socket() = fd 3\nbind(3, {sa_family=AF_INET, sin_port=htons(3000)}, 16) = 0</div>',
      refs: []
    },
    {
      short: '2. epoll_ctl() & libuv',
      title: '⚡ O Event Loop (epoll)',
      content: '<p>Linguagens antigas geravam 1 thread (gastando ~2MB RAM) por usuário. O Node não. Libuv delega o arquivo descritor de porta (o fd 3) para a Syscall <code>epoll_ctl()</code>.</p><p>Ao invés de esperar passivamente em <i>blocking mode</i>, a Main Thread do Node cai na <strong>Poll Phase</strong> do Event Loop e avisa o Kernel: "Se o FS 3 ganhar bytes via hardware, me acorde, se não eu vou rodar <span class="highlight">setInterval / setTimeout</span>!". Node processa milhares de dados em 1 Thread apenas alternando tarefas no epoll queue.</p>',
      refs: [{text: '(Event Loop Phases - Node.js)', url: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/'}]
    },
    {
      short: '3. accept4() e V8 Bindings',
      title: '📥 Accept e os Bindings V8',
      content: '<p>A placa de rede emite hardware-interrupt, epoll devolve a notificação para a Libuv, e a C-library executa a fast-syscall <code>accept4()</code> obtendo a referência ao novo cliente (fd=16).</p><p>A biblioteca C++ (TCPWrap) precisa agora acordar seu JavaScript. Utilizando os bindings internos do isolado <strong>V8 Isolate</strong>, ele chama silenciosamente as Functions pré-compiladas JS alertando que "Há um cliente".</p>',
      refs: []
    },
    {
      short: '4. read() vs Buffers do Node',
      title: '💾 Gerenciamento de Memória (Memória Off-Heap)',
      content: '<p>Os bytes estão no <i>Kernel Space</i>. O Node dispara a operação <code>read()</code> ou delegada ao pool. Para não sobrecarregar o coletor de lixo (Garbage Collector) do V8 (memória máxima padrão de 1.4GB a 4GB do <i>Heap</i>), os bytes caem no objeto Nativo Mapeado <strong>Buffer</strong>.</p><p>A classe estática Buffer aloca pedaços sobressalentes usando a library C (via <code>malloc/calloc</code>), economizando ciclos caríssimos de GC em cargas altas de requisições base64.</p>',
      refs: []
    },
    {
      short: '5. llhttp (A Mágica do Parser)',
      title: '🧠 llhttp C-Parser (Finite State Machine)',
      content: '<p>As strings puras de um pedido "GET /home HTTP/1.1" não são convertidas usando métodos RegEx (split) em Javascript, isso usaria milhões de ciclos vitais de CPU.</p><p>Em vez disso, um código engenhoso em C chamado <span class="highlight">llhttp</span> que funciona como um FSM (Finite State Machine) lê as correntes de bytes nativos por bit e reclassifica instantaneamente sem cópias redundantes, acionando um trigger na sua callback só para a entrega do <code>req.headers</code> montado limpinho em JSON-like.</p>',
      refs: [{text: 'Repositorio llhttp (TypeScript para C)', url: 'https://github.com/nodejs/llhttp'}]
    }
  ]
};
