# Arquitetura

## Componentes

1. **NVIDIA NIM** — serviço hospedado OpenAI-compatible em
   `https://integrate.api.nvidia.com/v1`.
2. **Credenciais do Windows** — mantém a chave NVIDIA como credencial genérica
   `NVIDIA-NIM`; o nome de usuário deve ser `NVIDIA_API_KEY`.
3. **Inicializador PowerShell** — lê a credencial via API nativa do Windows e
   fornece-a somente ao processo Node enquanto a ponte está ativa.
4. **Ponte Node local** — escuta exclusivamente em `127.0.0.1:8765`, injeta a
   chave NVIDIA nas chamadas HTTPS e não registra prompts, cabeçalhos ou
   respostas.
5. **Continue para VS Code** — usa o provedor OpenAI-compatible e se conecta à
   ponte. Sua configuração fica no perfil do usuário em
   `%USERPROFILE%\.continue\config.yaml`. A chave `local-nvidia-bridge` é
   somente um identificador local, não é a chave real NVIDIA.
6. **Cline para VS Code** — instalado como alternativa, mas a versão testada
   falha com a exceção Unicode `ByteString` ao enviar uma tarefa. Não é o agente
   validado neste ambiente.
7. **Claude Code** — permanece instalado separadamente; a autenticação
   existente não estava ativa na auditoria e não foi alterada.
8. **Tarefa agendada opcional** — pode iniciar a ponte no login do usuário
   atual, em janela PowerShell minimizada, sem privilégios administrativos.

## Fluxo

```text
VS Code / Continue
  -> HTTP loopback 127.0.0.1:8765
  -> ponte Node (valida o identificador local)
  -> HTTPS integrate.api.nvidia.com
  -> NVIDIA NIM
```

A ponte aceita somente `GET /v1/models` e `POST /v1/chat/completions`, limita
corpos a 20 MiB e rejeita conexões que não sejam loopback. Streaming do
upstream é encaminhado sem registrar o conteúdo. O campo proprietário
`reasoning_content` é removido das respostas; essa medida não resolveu o erro
Unicode observado no Cline.

## Limites de segurança

- A chave real é mantida no Credential Manager e existe em memória nos
  processos PowerShell/Node enquanto a ponte está em execução.
- O modelo ainda pode usar raciocínio internamente; a ponte apenas remove o
  campo separado de raciocínio da resposta encaminhada ao agente.
- O identificador `local-nvidia-bridge` é salvo na configuração global do
  Continue; se usado no Cline, também é apenas um identificador local. Ele não
  concede acesso ao NIM sem a ponte ativa e não substitui a chave real.
- A ponte não é um serviço permanente: inicie-a conscientemente e pare-a com
  `Ctrl+C` quando terminar.
- O início automático opcional mantém a ponte disponível durante toda a sessão
  do Windows. `Disable-NimBridgeStartup.ps1` desativa logins futuros, mas a
  instância atual ainda deve ser parada com `Ctrl+C`.
- O endpoint hospedado está sujeito a autenticação, disponibilidade, termos e
  limites da conta NVIDIA.
- A GPU local RTX 2060 não executa este modelo de 120B; a inferência validada é
  hospedada pela NVIDIA.
- O Cline reportou erro Unicode com o mesmo tipo de exceção registrado em
  [cline/cline#11163](https://github.com/cline/cline/issues/11163); o Continue é
  a alternativa configurada para evitar depender desse caminho.
