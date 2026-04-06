import { STEPS_CONTENT } from './content.js';

export const MOD_CRYPTO = {
  id: 'crypto',
  title: 'Criptografia & Segurança',
  steps: [
    {
      short: '1. Hashing (SHA-256)',
      title: '🔑 Funções Hash: Fingerprints Digitais',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'SHA-2 (Wikipedia)', url: 'https://en.wikipedia.org/wiki/SHA-2'},
        {text: 'FIPS 180-4 (SHA Standard)', url: 'https://csrc.nist.gov/publications/detail/fips/180/4/final'},
        {text: 'Merkle Tree (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Merkle_tree'}
      ]
    },
    {
      short: '2. Criptografia Simétrica',
      title: '🔐 Criptografia Simétrica: AES e Modos de Operação',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'AES (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Advanced_Encryption_Standard'},
        {text: 'FIPS 197 (AES Standard)', url: 'https://csrc.nist.gov/publications/detail/fips/197/final'},
        {text: 'Block Cipher Modes', url: 'https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation'}
      ]
    },
    {
      short: '3. Criptografia Assimétrica',
      title: '🗝️ Criptografia Assimétrica: RSA e Curvas Elípticas',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'RSA (Wikipedia)', url: 'https://en.wikipedia.org/wiki/RSA_(cryptosystem)'},
        {text: 'Elliptic Curve Cryptography', url: 'https://en.wikipedia.org/wiki/Elliptic-curve_cryptography'},
        {text: 'Curve25519 (Bernstein)', url: 'https://cr.yp.to/ecdh.html'}
      ]
    },
    {
      short: '4. Diffie-Hellman (ECDHE)',
      title: '🤝 Key Exchange: Diffie-Hellman e ECDHE',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'Diffie-Hellman (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange'},
        {text: 'ECDHE (RFC 8422)', url: 'https://datatracker.ietf.org/doc/html/rfc8422'},
        {text: 'Perfect Forward Secrecy', url: 'https://en.wikipedia.org/wiki/Forward_secrecy'}
      ]
    },
    {
      short: '5. Certificados X.509',
      title: '📜 PKI: Certificados X.509 e Cadeia de Confiança',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'X.509 (Wikipedia)', url: 'https://en.wikipedia.org/wiki/X.509'},
        {text: 'Let\'s Encrypt', url: 'https://letsencrypt.org/how-it-works/'},
        {text: 'Certificate Transparency', url: 'https://certificate.transparency.dev/'}
      ]
    },
    {
      short: '6. TLS 1.3 Deep Dive',
      title: '🔒 TLS 1.3: O Handshake Completo',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'RFC 8446 (TLS 1.3)', url: 'https://datatracker.ietf.org/doc/html/rfc8446'},
        {text: 'The Illustrated TLS 1.3', url: 'https://tls13.xargs.org/'},
        {text: 'How HTTPS Works', url: 'https://howhttps.works/'},
        {text: 'TLS 1.3 Key Schedule', url: 'https://datatracker.ietf.org/doc/html/rfc8446#section-7.1'}
      ]
    }
  ]
};
