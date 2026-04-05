export const MOD_NETWORKS = {
  id: 'net',
  title: 'Modelos de Rede & TCP/IP',
  steps: [
    {
      short: '1. Modelo OSI e TCP/IP',
      title: '📚 A Torre Abstrata do TCP/IP',
      content: '<p>A internet não é mágica, é altamente dividida em tarefas restritas chamadas <strong>Camadas OSI</strong> (condensadas no padrão TCP/IP em 4 peças). Uma camada confia cega-mente nas inferiores.</p><p>Quando você escreve sua "App" (Node/JS), você atinge o topo (L7/L5). Mas embaixo há I/O: as **Portas Pessoais (Transporte — L4)**, os **Roteadores (Rede IP — L3)** e as **Placas e Fios (Enlace e Físico — L2/L1)**. Cada camada se comunica secretamente apenas com sua mesma camada do outro lado do oceano.</p>',
      refs: [{text: '(ISO/IEC 7498-1 - Modelo de Referência OSI)', url: 'https://en.wikipedia.org/wiki/OSI_model'}]
    },
    {
      short: '2. Encapsulamento (A Viagem)',
      title: '📦 Encapsulamento vs Desencapsulamento',
      content: '<p>Na descida até a placa de rede da sua máquina, a requisição "GET /" recebe envelopes um ao redor do outro antes da viagem física. Isso se chama <span class="highlight">Encapsulamento</span>.</p><ul><li><strong>L7 (App):</strong> A payload bruta, os seus dados.</li><li><strong>L4 (Transport):</strong> Ganha o <code>Segmento TCP</code> (Source/Dest Port e Checks).</li><li><strong>L3 (Network):</strong> Recebe Envelope IPv4/IPv6 de Roteamento.</li><li><strong>L2 (Enlace):</strong> Vira um Quadro Ethernet e é convertido para Laser de Fibra (L1).</li></ul>',
      refs: []
    },
    {
      short: '3. TCP e o Handshake',
      title: '🤝 A Garantia do TCP (Transmission Control)',
      content: '<p>O TCP atua rigidamente L4. Ele só envia seu "payload" pesado quando o canal é provado resistente e organizado (<i>Connection-Oriented</i>). Isso gera o pesado "3-Way Handshake" antes de trafegar o HTTP Real.</p><p>O Cliente gera um SYN no L4, que desce, viaja o cabo, sobe pro Servidor L4. O kernel server devolve SYN-ACK. Só com o ACK final, o estado passa à <code>ESTABLISHED</code>. Se um pacote do meio sumir, o TCP segura a pilha e pede retransmissão obrigatória (Congestion Control e Retries silenciosos).</p>',
      refs: [{text: 'Kernel TCP Handshake Code (Github)', url: 'https://github.com/torvalds/linux/blob/master/net/ipv4/tcp_input.c'}]
    },
    {
      short: '4. UDP: O Datagrama Cru',
      title: '🚀 UDP (User Datagram Protocol)',
      content: '<p>Nem tudo pode pagar o peso e a lentidão do ACK do TCP em 100% dos pacotes. Em jogos (FPS), WebSockets/WebRTC (Vídeo e Voz) ou requisições DNS velozes, usa-se o <strong>UDP</strong>.</p><p>UDP é disparado às cegas da camada de Transporte, não há handshake e sua entrega não possui garantia de ordem nem de sucesso. Se foi perdido? O Servidor nem fica sabendo! É o modo assíncrono absoluto de metralhadora de redes da camada inferior que agora compõe o mais novo <i>HTTP/3 (QUIC)</i>.</p>',
      refs: [{text: '(Como QUIC superou TCP)', url: 'https://datatracker.ietf.org/doc/html/rfc9000'}]
    }
  ]
};
