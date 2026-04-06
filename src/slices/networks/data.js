import { STEPS_CONTENT } from './content.js';

export const MOD_NETWORKS = {
  id: 'net',
  title: 'Modelos de Rede & TCP/IP',
  steps: [
    {
      short: '1. Modelo OSI e TCP/IP',
      title: '📚 A Torre de Camadas: OSI e TCP/IP',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'ISO/IEC 7498-1 (Modelo OSI)', url: 'https://en.wikipedia.org/wiki/OSI_model'},
        {text: 'RFC 1122 (Requisitos do Host Internet)', url: 'https://datatracker.ietf.org/doc/html/rfc1122'}
      ]
    },
    {
      short: '2. Encapsulamento (Headers)',
      title: '📦 Encapsulamento: A Anatomia de um Pacote',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'Wireshark (Análise de Pacotes)', url: 'https://www.wireshark.org/'},
        {text: 'RFC 791 (IPv4)', url: 'https://datatracker.ietf.org/doc/html/rfc791'}
      ]
    },
    {
      short: '3. Resolução DNS',
      title: '🌍 DNS: Traduzindo Nomes em Endereços IP',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'RFC 1035 (DNS)', url: 'https://datatracker.ietf.org/doc/html/rfc1035'},
        {text: 'How DNS Works (comic)', url: 'https://howdns.works/'}
      ]
    },
    {
      short: '4. TCP 3-Way Handshake',
      title: '🤝 TCP: Garantia de Entrega e Controle de Fluxo',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'TCP no Kernel Linux (tcp_input.c)', url: 'https://github.com/torvalds/linux/blob/master/net/ipv4/tcp_input.c'},
        {text: 'RFC 9293 (TCP Atualizado)', url: 'https://datatracker.ietf.org/doc/html/rfc9293'},
        {text: 'Congestion Control Explained', url: 'https://en.wikipedia.org/wiki/TCP_congestion_control'},
        {text: 'BBR: Congestion-Based (Google)', url: 'https://research.google/pubs/bbr-congestion-based-congestion-control/'}
      ]
    },
    {
      short: '5. UDP e HTTP/3 (QUIC)',
      title: '🚀 UDP e QUIC: Velocidade sobre Garantia',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'RFC 9000 (QUIC)', url: 'https://datatracker.ietf.org/doc/html/rfc9000'},
        {text: 'RFC 9114 (HTTP/3)', url: 'https://datatracker.ietf.org/doc/html/rfc9114'},
        {text: 'HTTP/3 Explained', url: 'https://http3-explained.haxx.se/'}
      ]
    },
    {
      short: '6. TLS/HTTPS (Criptografia)',
      title: '🔒 TLS: Criptografia em Trânsito',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'RFC 8446 (TLS 1.3)', url: 'https://datatracker.ietf.org/doc/html/rfc8446'},
        {text: 'How HTTPS Works (comic)', url: 'https://howhttps.works/'},
        {text: 'Let\'s Encrypt (CA Gratuita)', url: 'https://letsencrypt.org/'}
      ]
    }
  ]
};
