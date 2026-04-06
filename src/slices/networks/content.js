const STEP_1 =
`<p>A internet não é mágica — é uma arquitetura rigorosamente dividida em <strong>camadas de abstração</strong>, onde cada nível realiza uma tarefa específica e confia cegamente nas camadas inferiores. Essa separação permite que engenheiros trabalhem em uma camada sem conhecer os detalhes das demais.</p>
<p>O <strong>Modelo OSI</strong> (Open Systems Interconnection, ISO/IEC 7498) define 7 camadas teóricas. Na prática, a internet usa o <span class="highlight">Modelo TCP/IP</span> que condensa tudo em 4 camadas funcionais:</p>
<div class="code-block">OSI (7 camadas)           TCP/IP (4 camadas)       PDU
─────────────────────────────────────────────────────────
L7 Aplicação  ┐
L6 Apresentação├────────→ Aplicação (HTTP,DNS,TLS)  Dados
L5 Sessão     ┘
L4 Transporte ──────────→ Transporte (TCP, UDP)     Segmento
L3 Rede       ──────────→ Internet (IP, ICMP)       Pacote
L2 Enlace     ┐
L1 Físico     ┘────────→ Acesso à Rede (Ethernet)  Quadro/Bits</div>
<p>Cada camada adiciona seu próprio <strong>cabeçalho (header)</strong> ao redor dos dados — a chamada <strong>PDU (Protocol Data Unit)</strong> — e cada camada só se comunica com sua equivalente no lado oposto:</p>
<ul><li><strong>L7 — Aplicação:</strong> O seu código. HTTP, HTTPS, DNS, FTP, SMTP, WebSocket. Define <em>o que</em> você quer (GET /api/users). Não se preocupa com rotas ou fios.</li><li><strong>L4 — Transporte:</strong> Gerencia a entrega confiável (TCP) ou rápida (UDP). Identifica processos por <strong>Portas</strong> (0-65535). Src Port: efêmera (ex: 52431), Dst Port: serviço (ex: 443).</li><li><strong>L3 — Rede (Internet):</strong> Responsável pelo <strong>roteamento</strong> entre redes diferentes via endereços IP. Cada roteador no caminho lê apenas este cabeçalho para decidir o "próximo salto" (next hop).</li><li><strong>L2 — Enlace:</strong> Comunicação <em>dentro</em> de uma rede local (LAN). Usa endereços <strong>MAC</strong> (48 bits, gravados no hardware da placa). ARP traduz IP → MAC.</li><li><strong>L1 — Físico:</strong> Pulsos elétricos (Ethernet), luz (Fibra Óptica) ou ondas de rádio (Wi-Fi). Define voltagens, frequências e conectores.</li></ul>
<p>O princípio fundamental é o <strong>encapsulamento</strong>: cada camada trata o conteúdo das superiores como um "payload" opaco, adiciona seu próprio header, e entrega para baixo. No destino, o processo inverso (desencapsulamento) remove os headers de baixo para cima até chegar aos dados originais.</p>`;

const STEP_2 =
`<p>Quando seu navegador dispara <code>GET /index.html HTTP/1.1</code>, essa string de texto não viaja diretamente pelo fio. Na descida até a placa de rede, a requisição recebe <strong>envelopes concêntricos</strong> — cada camada adiciona seu cabeçalho (header) ao redor do payload anterior. Esse processo é o <span class="highlight">Encapsulamento</span>.</p>
<div class="code-block">Viagem de Descida (Encapsulamento):

[Aplicação]  →  "GET /index.html HTTP/1.1\r\nHost: exemplo.com"
                 │
[Transporte] →  ┌──TCP Header (20B)─┬──Payload HTTP──────────┐
                │Src:52431 Dst:443  │ GET /index.html ...     │
                │Seq:0 Ack:0 Flags │                         │
                └───────────────────┴────────────────────────┘
                 │
[Rede]       →  ┌──IP Header (20B)──┬──Segmento TCP──────────┐
                │Src:192.168.1.5    │ [TCP][HTTP Payload]     │
                │Dst:142.250.79.4   │                         │
                │TTL:64 Proto:TCP   │                         │
                └───────────────────┴────────────────────────┘
                 │
[Enlace]     →  ┌──Eth (14B)──┬──Pacote IP────────┬──FCS (4B)┐
                │Dst MAC│Src  │ [IP][TCP][HTTP]   │ Checksum │
                │MAC│Type     │                   │          │
                └─────────────┴───────────────────┴──────────┘</div>
<p>Cada header tem tamanho e campos fixos:</p>
<ul><li><strong>Ethernet Header (14 bytes):</strong> MAC Destino (6B) + MAC Origem (6B) + EtherType (2B, ex: 0x0800 = IPv4).</li><li><strong>IPv4 Header (20-60 bytes):</strong> Versão, IHL, TTL (Time To Live — decrementado a cada roteador, evita loops infinitos), Protocol (6=TCP, 17=UDP), IP Origem, IP Destino, Checksum.</li><li><strong>TCP Header (20-60 bytes):</strong> Porta Origem, Porta Destino, Sequence Number, Acknowledgment Number, Flags (SYN/ACK/FIN/RST), Window Size, Checksum.</li></ul>
<p>O tamanho máximo de um quadro Ethernet é o <strong>MTU (Maximum Transmission Unit)</strong>, tipicamente <strong>1500 bytes</strong>. Subtraindo os headers (20B IP + 20B TCP = 40B), sobram 1460 bytes de payload por segmento — o <strong>MSS (Maximum Segment Size)</strong>. Se os dados excedem o MSS, o TCP fragmenta em múltiplos segmentos numerados sequencialmente.</p>
<p>No destino, o processo inverso (<strong>desencapsulamento</strong>) ocorre: a placa de rede remove o header Ethernet, o kernel remove o header IP, depois o TCP, até entregar o payload HTTP limpo à aplicação.</p>`;

const STEP_3 =
`<p>Quando você digita <code>www.google.com</code> no navegador, o computador não sabe o que fazer com esse nome — ele precisa do <strong>endereço IP</strong> (ex: 142.250.79.4) para iniciar a conexão TCP. A tradução de nomes legíveis em IPs é feita pelo <span class="highlight">DNS (Domain Name System)</span>, um sistema distribuído hierárquico que funciona como a "agenda telefônica" da internet.</p>
<p>O processo de resolução segue uma cadeia hierárquica:</p>
<div class="code-block">Consulta: "Qual é o IP de www.google.com?"

1. Cache Local (Browser → SO → Router)
   → Se encontrou, retorna imediatamente (TTL ativo)
   → Se não, pergunta ao Resolver Recursivo do ISP

2. Resolver Recursivo (ISP/Cloudflare 1.1.1.1/Google 8.8.8.8)
   → Consulta Root Server: "Quem cuida de .com?"
   ← Resposta: "Pergunte ao TLD Server 192.5.6.30"

3. TLD Server (.com)
   → "Quem cuida de google.com?"
   ← "Pergunte ao Authoritative NS 216.239.32.10"

4. Authoritative Name Server (Google)
   → "Qual o IP de www.google.com?"
   ← "142.250.79.4" (Registro tipo A, TTL: 300s)</div>
<p>Existem 13 clusters de <strong>Root Servers</strong> (A-M), distribuídos globalmente via Anycast (~1500 instâncias reais). Cada cluster conhece os servidores TLD (.com, .br, .org, .net, etc.).</p>
<p>Tipos de registros DNS mais importantes:</p>
<ul><li><strong>A</strong> — Mapeia nome → IPv4 (ex: 142.250.79.4)</li><li><strong>AAAA</strong> — Mapeia nome → IPv6 (ex: 2607:f8b0:4004::64)</li><li><strong>CNAME</strong> — Alias para outro nome (ex: www.exemplo.com → exemplo.com)</li><li><strong>MX</strong> — Servidor de email do domínio</li><li><strong>TXT</strong> — Texto arbitrário (SPF, DKIM, verificação de domínio)</li><li><strong>NS</strong> — Name Servers autoritativos do domínio</li></ul>
<p>O <strong>TTL (Time To Live)</strong> define por quanto tempo a resposta pode ser cacheada. TTL baixo (60s) permite mudanças rápidas (failover), TTL alto (86400s) reduz consultas mas atrasa propagação. A maioria das consultas DNS usa <strong>UDP na porta 53</strong> (rápido, sem handshake), mas respostas grandes ou transferências de zona usam TCP. Modernamente, <strong>DoH</strong> (DNS over HTTPS) e <strong>DoT</strong> (DNS over TLS) criptografam as consultas para privacidade.</p>`;

const STEP_4 =
`<p>O <strong>TCP (Transmission Control Protocol)</strong> opera na Camada 4 (Transporte) e garante entrega <em>confiável, ordenada e sem duplicatas</em>. Antes de transmitir qualquer byte de payload, o TCP estabelece uma conexão através do famoso <span class="highlight">3-Way Handshake</span>:</p>
<div class="code-block">Cliente                          Servidor
   │                                 │
   │──── SYN (Seq=100) ────────────→ │  Estado: SYN_SENT
   │                                 │  Estado: SYN_RECEIVED
   │←─── SYN-ACK (Seq=300,Ack=101) ─│
   │                                 │
   │──── ACK (Seq=101,Ack=301) ────→ │  Estado: ESTABLISHED
   │                                 │  Estado: ESTABLISHED
   │                                 │
   │←──── Dados HTTP (Payload) ────→ │  Transferência bidirecional</div>
<p>Cada lado escolhe um <strong>ISN (Initial Sequence Number)</strong> aleatório por segurança (evita ataques de predição de sequência). O Sequence Number rastreia cada byte enviado — não cada pacote. Se enviei 1000 bytes a partir de Seq=101, o próximo segmento será Seq=1101.</p>
<p>Mecanismos de confiabilidade do TCP:</p>
<ul><li><strong>ACK Cumulativo:</strong> O receptor confirma todos os bytes recebidos até o número N. Se o ACK=5001, significa "recebi tudo até o byte 5000, espero o 5001".</li><li><strong>Retransmissão:</strong> Se o sender não recebe ACK dentro do <strong>RTO (Retransmission Timeout)</strong>, reenvia o segmento. O RTO é calculado dinamicamente com base no RTT (Round-Trip Time) medido.</li><li><strong>Selective ACK (SACK):</strong> Extensão que permite ao receptor informar exatamente quais blocos recebeu, evitando retransmitir o que já chegou.</li><li><strong>Window Size:</strong> O receptor anuncia quantos bytes pode receber antes de estourar seu buffer (Flow Control). Se o receptor está lento, anuncia janela menor, freando o sender.</li></ul>
<p><strong>Controle de Congestionamento</strong> — evita colapso da rede:</p>
<div class="code-block">1. Slow Start:     cwnd começa em 1 MSS, dobra a cada RTT (crescimento exponencial)
2. Congestion Avoidance: Ao atingir ssthresh, cresce 1 MSS/RTT (linear)
3. Fast Retransmit: 3 ACKs duplicados → retransmite sem esperar timeout
4. Fast Recovery:   Reduz cwnd pela metade (não volta ao Slow Start)

Algoritmos Modernos:

CUBIC (Linux default desde 2006):
  cwnd = C × (t - K)³ + Wmax
  → Crescimento cúbico: agressivo longe de Wmax, cauteloso perto
  → Wmax = cwnd no último evento de perda
  → Independente de RTT → fairness entre fluxos de latências distintas

BBR (Google, 2016 — Bottleneck Bandwidth and RTT):
  Modelo: estima BtlBw (max bandwidth) e RTprop (min RTT)
  → cwnd ótimo = BtlBw × RTprop
  → 4 fases: Startup → Drain → ProbeBW → ProbeRTT
  → Não depende de packet loss para ajustar
  → Resolve bufferbloat (buffers grandes em roteadores)
  → Usado no YouTube, Google Cloud, TCP kernel 4.9+</div>
<p>O encerramento usa <strong>4-Way Termination</strong>: FIN → ACK → FIN → ACK, permitindo que cada lado feche sua direção independentemente (half-close). O estado <code>TIME_WAIT</code> (2×MSL, ~60s) garante que segmentos atrasados não contaminem novas conexões na mesma porta.</p>`;

const STEP_5 =
`<p>Nem tudo pode pagar o custo do handshake e dos ACKs do TCP. O <strong>UDP (User Datagram Protocol)</strong> é o protocolo "dispara e esquece" da Camada 4 — sem conexão, sem confirmação, sem ordenação.</p>
<div class="code-block">Header UDP (apenas 8 bytes!):
┌──────────────┬──────────────┐
│ Src Port (2B)│ Dst Port (2B)│
├──────────────┼──────────────┤
│ Length   (2B)│ Checksum (2B)│
└──────────────┴──────────────┘
+ Payload (dados)

Comparação:
• TCP Header: 20-60 bytes + handshake + ACKs + retransmissão
• UDP Header: 8 bytes fixos + disparo imediato</div>
<p>Casos de uso ideais para UDP:</p>
<ul><li><strong>DNS:</strong> Consultas curtas (pergunta-resposta), sem necessidade de conexão persistente. Cabe em um único datagrama.</li><li><strong>Jogos Online (FPS):</strong> A posição do frame 60 de 0.5s atrás é irrelevante — o frame 120 já a substituiu. Retransmitir seria desperdiçar latência.</li><li><strong>VoIP/Videoconferência:</strong> Um pacote de áudio perdido causa um micro-glitch imperceptível; esperar retransmissão causaria atraso perceptível.</li><li><strong>Streaming (QUIC/HTTP3):</strong> Multiplexação de streams sem Head-of-Line Blocking.</li></ul>
<p>O protocolo <span class="highlight">QUIC</span> (RFC 9000), desenvolvido pelo Google e adotado como base do <strong>HTTP/3</strong>, é construído <em>sobre UDP</em> mas reimplementa as garantias do TCP em user-space:</p>
<div class="code-block">QUIC vs TCP+TLS:

• Handshake: TCP+TLS = 3 RTTs (SYN+SYN-ACK + TLS Hello)
  QUIC     = 1 RTT (integra cripto no handshake)
  QUIC 0-RTT = 0 RTTs para reconexões!

  0-RTT em detalhe:
  → Cliente armazena PSK (Pre-Shared Key) da sessão anterior
  → Na reconexão, envia Early Data cifrado com PSK no ClientHello
  → Servidor decifra imediatamente → latência zero!
  → Risco: replay attack (atacante reenvia o pacote capturado)
    Mitigação: aceitar 0-RTT apenas para requests idempotentes
    Servidor mantém anti-replay token de uso único

• Head-of-Line Blocking:
  TCP: 1 pacote perdido bloqueia TODOS os streams
  QUIC: Cada stream é independente, perda afeta só aquele

• Migração de Conexão:
  TCP: Conexão morre ao trocar de Wi-Fi → 4G (IP muda)
  QUIC: Connection ID independente do IP → migração transparente

• Connection Migration (detalhe):
  TCP: tupla (src_ip, src_port, dst_ip, dst_port) = conexão
  → Mudou IP? Conexão morreu. Novo handshake completo.
  QUIC: Connection ID (CID) de 160 bits identifica a sessão
  → Cliente troca de rede → envia PATH_CHALLENGE com novo IP
  → Servidor valida via PATH_RESPONSE → sessão continua
  → Zero interrupção ao trocar Wi-Fi ↔ 4G/5G</div>
<p>QUIC roda inteiramente em user-space (não no kernel), permitindo updates rápidos sem patchear o SO. Navegadores modernos já usam HTTP/3+QUIC para a maioria das conexões a servidores compatíveis (Google, Cloudflare, Meta).</p>`;

const STEP_6 =
`<p>Sem criptografia, qualquer roteador intermediário pode ler seus dados em texto plano — senhas, cookies, mensagens. O <strong>TLS (Transport Layer Security)</strong> cria um canal cifrado entre cliente e servidor, transformando HTTP em <span class="highlight">HTTPS</span>.</p>
<p>O TLS combina dois tipos de criptografia:</p>
<ul><li><strong>Assimétrica (RSA/ECDHE):</strong> Par de chaves pública/privada. A chave pública cifra, só a privada decifra. Lenta demais para dados em massa, mas perfeita para trocar uma chave secreta com segurança. Usada apenas no handshake.</li><li><strong>Simétrica (AES-256-GCM / ChaCha20):</strong> Uma única chave secreta (compartilhada no handshake) cifra e decifra. Extremamente rápida — hardware moderno tem instruções AES-NI dedicadas. Usada para todos os dados após o handshake.</li></ul>
<p>O <strong>TLS 1.3 Handshake</strong> (2018, RFC 8446) reduziu a negociação para apenas <strong>1 RTT</strong>:</p>
<div class="code-block">Cliente                              Servidor
  │                                      │
  │─── ClientHello ────────────────────→ │
  │    • Versão TLS suportada            │
  │    • Cipher Suites aceitas           │
  │    • Chave pública ECDHE (Key Share) │
  │    • SNI (Server Name Indication)    │
  │                                      │
  │←── ServerHello + Certificado ─────── │
  │    • Cipher Suite escolhida          │
  │    • Chave pública ECDHE do server   │
  │    • Certificado X.509 (assinado CA) │
  │    • Finished (verificação)          │
  │                                      │
  │─── Finished ───────────────────────→ │
  │    ═══ Canal cifrado estabelecido ═══ │
  │←──── Dados HTTP cifrados (AES) ────→ │</div>
<p>A <strong>Cadeia de Certificados</strong> garante autenticidade:</p>
<ul><li><strong>Root CA</strong> — Autoridade raiz (DigiCert, Let's Encrypt, GlobalSign). Pré-instalada no SO/navegador. ~150 CAs confiáveis mundialmente.</li><li><strong>Intermediate CA</strong> — Assinada pela Root. Emite certificados finais (evita expor a chave da Root).</li><li><strong>Leaf Certificate</strong> — O certificado do site (google.com), assinado pela Intermediate. Contém a chave pública do servidor e o domínio.</li></ul>
<p>O cliente valida toda a cadeia até uma Root CA confiável. Se qualquer elo for inválido, expirado ou revogado (CRL/OCSP), a conexão é rejeitada com erro de certificado.</p>
<p><strong>Perfect Forward Secrecy (PFS)</strong> via ECDHE garante que, mesmo se a chave privada do servidor for comprometida no futuro, sessões passadas não podem ser decifradas — cada sessão gera chaves efêmeras únicas que são descartadas após o uso.</p>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];
