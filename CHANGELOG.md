# Changelog

## 2026-10-22

- Validado o endpoint OpenAI-compatible da NVIDIA com uma solicitação real ao
  modelo `nvidia/nemotron-3.5-super-vl-120b-a12b`.
- Adicionada uma ponte local que lê a chave do Windows Credential Manager e a
  encaminha em memória para a NVIDIA, sem persistir a chave no projeto.
- Instalado Cline 4.1.25 para configuração como agente OpenAI-compatible.
- Após o Cline apresentar erro Unicode `ByteString`, instalado Continue 2.0.0
  e configurado o modelo NVIDIA em `%USERPROFILE%\.continue\config.yaml`,
  usando somente o identificador local da ponte.
- Confirmados no Continue uma resposta de chat real do NIM e a análise correta
  do arquivo de exemplo, sem edição de arquivos nem execução de comandos.
- Adicionadas instruções, proteção para arquivos `.env` e um exemplo pequeno
  para testar leitura de arquivo pelo agente.
- Claude Code e sua autenticação não foram alterados; a instalação estava
  presente, mas sem sessão autenticada na auditoria.
