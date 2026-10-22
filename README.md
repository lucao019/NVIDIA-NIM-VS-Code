# Central de IA para Desenvolvimento no VS Code

Este diretório contém uma ponte local para usar NVIDIA NIM no VS Code sem
gravar a chave real da NVIDIA nas configurações do agente ou no projeto.

## Componentes

- NVIDIA NIM: endpoint OpenAI-compatible hospedado em
  `https://integrate.api.nvidia.com/v1`.
- Modelo: `nvidia/nemotron-3.5-super-vl-120b-a12b`.
- Continue: agente de programação do VS Code, configurado globalmente para
  falar com a ponte local.
- Cline: instalado, mas a versão testada falha ao enviar tarefas por um erro
  Unicode `ByteString` (Cline issue #11163). Pode permanecer instalado, porém
  ainda não foi validado com este modelo.
- Claude Code: já estava instalado no ambiente, mas ainda não estava
  autenticado durante a auditoria. É independente do Cline/NIM.

## Requisitos

- Windows e VS Code.
- Node.js e Windows PowerShell.
- Uma credencial genérica no Gerenciador de Credenciais do Windows:
  - Destino: `NVIDIA-NIM`
  - Nome de usuário: `NVIDIA_API_KEY`
  - Senha: chave criada no portal NVIDIA.

Não coloque a chave NVIDIA no projeto, no `.env`, na configuração do Cline ou
em comandos. A extensão guarda sua própria chave de acesso à ponte local; essa
chave não é a credencial NVIDIA.

## Iniciar a ponte

No terminal PowerShell integrado do VS Code, aberto neste diretório:

```powershell
.\Start-NvidiaNimBridge.ps1
```

Mantenha esse terminal aberto enquanto usar o agente. Para parar a ponte,
pressione `Ctrl+C`.

## Usar os agentes

O Continue foi configurado em `%USERPROFILE%\.continue\config.yaml`. Se a
extensão pedir recarga, use **Developer: Reload Window** e abra o painel
Continue. O modelo global configurado é `NVIDIA Nemotron 3.5 Super`; ele deve
ser tratado como agente principal nesta configuração.

O Cline também pode apontar para a mesma ponte com esses campos:

- Base URL: `http://127.0.0.1:8765/v1`
- API Key: `local-nvidia-bridge`
- Model ID: `nvidia/nemotron-3.5-super-vl-120b-a12b`

Porém, o Cline instalado apresentou um erro de codificação ao enviar uma
mensagem curta. Veja [a limitação conhecida](docs/CONFIGURACAO.md) antes de
usá-lo.

O suporte efetivo a chamadas de ferramentas ainda depende de validação
interativa. O identificador local não substitui nem revela a chave NVIDIA.

## Teste manual

Com a ponte em execução, peça ao Continue para abrir e explicar
`examples/agent-smoke-test.js`, sem editar o arquivo. Isso confirma o caminho
VS Code → agente → ponte local → NVIDIA NIM.

Consulte [docs/CONFIGURACAO.md](docs/CONFIGURACAO.md) para detalhes,
diagnóstico e limitações.

O teste de chat e a análise de leitura do arquivo de exemplo já foram
executados no Continue; edição de arquivos e uso de ferramentas continuam
pendentes de validação.
