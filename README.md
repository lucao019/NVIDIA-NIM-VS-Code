# NVIDIA NIM no VS Code — tutorial passo a passo

Este guia ensina a conectar o NVIDIA NIM ao VS Code no Windows, sem colocar a
chave real da NVIDIA no projeto. Siga os passos na ordem. Não precisa saber
programar para preparar a conexão.

> **Importante:** a chave real é privada. Nunca a envie em chats, prints,
> commits, GitHub, arquivos do projeto ou comandos que possam ficar salvos no
> histórico do terminal.

## O que você vai montar

O caminho da mensagem é:

```text
Seu pedido -> Continue no VS Code -> ponte local -> NVIDIA NIM
```

A ponte local busca a chave no Gerenciador de Credenciais do Windows. O
Continue usa apenas um código local (`local-nvidia-bridge`), não a chave real
da NVIDIA.

**Limite de segurança:** esse código local não é uma senha forte nem protege
contra outros programas executados na sua conta do Windows. Enquanto a ponte
estiver aberta, mantenha o VS Code e o computador protegidos e feche a ponte
com `Ctrl+C` quando terminar.

## Antes de começar

Você precisa de:

1. Windows 10 ou 11.
2. Visual Studio Code.
3. Node.js instalado.
4. Uma conta NVIDIA com acesso ao endpoint NIM.
5. Uma chave NIM válida, guardada no Gerenciador de Credenciais do Windows.

O modelo escolhido é hospedado pela NVIDIA. Ele **não é baixado nem executado
na sua RTX 2060**; o computador envia pedidos pela internet ao serviço NVIDIA.
O acesso está sujeito à disponibilidade, aos limites e aos termos da sua conta.

## Passo 1 — Baixar este projeto

Se ainda não baixou o projeto:

1. Abra o VS Code.
2. Abra o terminal integrado com **Terminal > New Terminal**.
3. No terminal, copie e execute:

```powershell
git clone https://github.com/lucao019/NVIDIA-NIM-VS-Code.git
```

4. Abra a pasta baixada:

```powershell
code .\NVIDIA-NIM-VS-Code
```

Se o comando `code` não for reconhecido, no VS Code escolha **File > Open
Folder...** e selecione a pasta `NVIDIA-NIM-VS-Code`.

Se você já abriu esta pasta no VS Code, pule este passo.

## Passo 2 — Confirmar os programas necessários

No terminal integrado do VS Code, execute um comando de cada vez:

```powershell
node --version
```

```powershell
git --version
```

Cada comando deve mostrar um número de versão. Se algum deles não for
reconhecido, instale Node.js ou Git somente do site oficial correspondente,
feche e reabra o VS Code e tente de novo. Não é necessário instalar Python
para usar a ponte deste projeto.

## Passo 3 — Guardar a chave NVIDIA no Windows

Este passo é necessário uma única vez em cada computador:

1. Gere sua chave no portal oficial [build.nvidia.com](https://build.nvidia.com/).
   Use uma conta e um modelo que mostrem acesso a um endpoint/API.
2. **Não cole a chave neste README, no Continue nem no chat.**
3. Pressione **Win + R**.
4. Digite `control /name Microsoft.CredentialManager` e pressione Enter.
5. Clique em **Credenciais do Windows**.
6. Clique em **Adicionar uma credencial genérica**.
7. Preencha exatamente:

   - **Endereço de rede ou Internet:** `NVIDIA-NIM`
   - **Nome de usuário:** `NVIDIA_API_KEY`
   - **Senha:** sua chave real NVIDIA

8. Salve a credencial.

Se uma credencial `NVIDIA-NIM` já existir, use **Editar** para atualizá-la.
Não crie várias entradas com nomes diferentes: o inicializador procura
exatamente `NVIDIA-NIM`.

## Passo 4 — Instalar a extensão Continue

1. No VS Code, pressione **Ctrl+Shift+X** para abrir Extensions.
2. Pesquise **Continue**.
3. Instale a extensão **Continue** publicada por `Continue`.
4. Se o VS Code pedir para recarregar, aceite.
5. Abra o painel **Continue** pelo ícone na barra lateral.

O Cline pode estar instalado também, mas neste ambiente apresentou um erro
`ByteString` ao enviar mensagens. Para o NVIDIA NIM, use Continue.

## Passo 5 — Configurar o Continue para usar a ponte

O Continue precisa de uma configuração no seu perfil do Windows. Essa
configuração é diferente dos arquivos deste repositório.

1. No VS Code, pressione **Ctrl+Shift+P**.
2. Digite e escolha **Continue: Open Settings** ou abra o arquivo
   `%USERPROFILE%\.continue\config.yaml`.
3. Se esse arquivo já tiver configurações que você usa, **não apague tudo**.
   Faça uma cópia de segurança antes de editar e preserve o que já existe.
4. Para uma configuração nova e vazia, use este conteúdo:

```yaml
name: NVIDIA NIM
version: 1.0.0
schema: v1
models:
  - name: NVIDIA Nemotron 3.5 Super
    provider: openai
    model: nvidia/nemotron-3.5-super-vl-120b-a12b
    apiBase: http://127.0.0.1:8765/v1
    apiKey: local-nvidia-bridge
    roles:
      - chat
      - edit
      - apply
    capabilities:
      - tool_use
    requestOptions:
      timeout: 120000
```

5. Salve o arquivo.
6. Se a configuração não aparecer, pressione **Ctrl+Shift+P**, escolha
   **Developer: Reload Window** e aguarde o VS Code abrir novamente.
7. No painel Continue, selecione **NVIDIA Nemotron 3.5 Super**.

`local-nvidia-bridge` é o código usado entre Continue e a ponte neste
computador. **Não o substitua pela chave real NVIDIA.** A chave real continua
guardada no Windows.

## Passo 6 — Ligar a ponte NVIDIA

### Opção A — Início automático ao entrar no Windows

Se quiser que a ponte comece sozinha após entrar na conta do Windows, abra
esta pasta no VS Code, inicie um terminal PowerShell e execute **uma vez**:

```powershell
.\Install-NimBridgeStartup.ps1
```

O Windows cria uma tarefa para sua conta normal (sem privilégios de
administrador). Ela será executada no próximo login, em uma janela PowerShell
minimizada. A chave continua somente no Gerenciador de Credenciais.

**Segurança:** com essa opção, a ponte fica ativa durante toda a sua sessão do
Windows, mesmo quando não estiver programando. Para desativar os próximos
inícios automáticos, execute:

```powershell
.\Disable-NimBridgeStartup.ps1
```

Esse comando não encerra uma ponte que já está rodando. Para pará-la agora,
restaure a janela PowerShell minimizada e pressione `Ctrl+C`.

### Opção B — Início manual

Se preferir não deixar a ponte iniciar em cada login:

1. No VS Code, abra **Terminal > New Terminal**.
2. No PowerShell, execute:

```powershell
.\Start-NvidiaNimBridge.ps1
```

3. Espere aparecer:

```powershell
Local NVIDIA NIM bridge is ready at http://127.0.0.1:8765/v1.
```

4. Deixe o terminal aberto enquanto usa a IA. Digite seus pedidos no chat
   Continue, não no terminal.

Se o terminal disser que não encontrou a credencial, volte ao Passo 3 e
confira o nome e o usuário da credencial. Se a mensagem mencionar política de
execução do PowerShell, não altere a política do Windows por conta própria;
peça ajuda antes.

## Passo 7 — Fazer seu primeiro pedido

1. Abra o painel **Continue**.
2. Confira se o modelo selecionado é **NVIDIA Nemotron 3.5 Super**.
3. Digite:

```text
Responda somente: NIM conectado.
```

4. Envie a mensagem e aguarde a resposta.

Depois, teste a leitura de um arquivo com:

```text
Leia examples/agent-smoke-test.js. Explique o que a função formatGreeting faz
e dê um exemplo de entrada de borda. Não edite arquivos nem execute comandos.
```

Esse pedido apenas consulta o arquivo. O teste no Continue já foi feito e o
agente explicou corretamente a função e o caso `null`/`undefined`.

## Passo 8 — Usar o agente com cuidado

- Comece pedindo para **explicar ou analisar**, sem editar.
- Para alterações, peça primeiro uma proposta e revise o diff antes de
  aceitar.
- Não autorize comandos que você não entenda.
- Não aceite exclusões em massa, `git reset --hard`, `git clean -fd` ou push
  sem revisar o que será feito.
- Não ative aprovação automática para escrita/terminal se quiser aprovar cada
  operação.
- O modelo pode errar. Confira mudanças e rode os testes do seu projeto.

## Passo 9 — Encerrar

Quando terminar de usar o NIM:

1. No modo automático, restaure a janela PowerShell minimizada da ponte.
   No modo manual, clique no terminal onde executou o inicializador.
2. Pressione **Ctrl+C**.
3. A ponte será encerrada nesta sessão. Se a tarefa automática continuar
   ativa, ela iniciará novamente no próximo login do Windows.

Para desativar futuros inícios automáticos, abra a pasta deste projeto no VS
Code e execute:

```powershell
.\Disable-NimBridgeStartup.ps1
```

Isso não encerra a ponte que já está rodando; pare-a também com **Ctrl+C**.
Para voltar a iniciar automaticamente, execute
`.\Install-NimBridgeStartup.ps1`.

## Problemas comuns

### “Credential not found”

A credencial não foi encontrada. Confira **Windows Credentials > Generic
Credentials** e confirme:

- Endereço: `NVIDIA-NIM`
- Usuário: `NVIDIA_API_KEY`

Não envie a senha/chave para pedir ajuda.

### “Could not connect” ou a mensagem fica aguardando

1. Confira se o terminal da ponte continua aberto.
2. Confirme que ele mostra `Local NVIDIA NIM bridge is ready`.
3. Confira se a internet está funcionando.
4. Tente novamente uma única vez.

### Erro 401 ou autenticação inválida

A NVIDIA não aceitou a chave, ou o acesso ao endpoint não está habilitado.
Atualize a chave pelo portal NVIDIA e no Gerenciador de Credenciais. Não a
cole no Continue, no `.env` ou no terminal.

### O modelo não aparece no Continue

1. Confirme que salvou `%USERPROFILE%\.continue\config.yaml`.
2. Confira se a indentação YAML corresponde ao exemplo do Passo 5.
3. Execute **Developer: Reload Window** na Paleta de Comandos.
4. Reabra Continue e procure `NVIDIA Nemotron 3.5 Super`.

### Cline mostra “ByteString”

Use o Continue para NVIDIA NIM. O Cline instalado apresentou esse erro mesmo
com mensagens curtas. Os detalhes estão em
[docs/CONFIGURACAO.md](docs/CONFIGURACAO.md).

## Claude Code e Git

Claude Code é um chat/agente separado. A instalação já existia, mas não estava
autenticada; faça login somente pelo fluxo oficial se sua conta permitir. Ele
não usa automaticamente a conversa nem a autenticação do NVIDIA NIM.

O projeto está no [GitHub](https://github.com/lucao019/NVIDIA-NIM-VS-Code).
Revise `git status` e os diffs antes de criar commits ou fazer push. Arquivos
`.env` são ignorados pelo Git, mas **não use `.env` para guardar a chave**:
este projeto lê a chave do Gerenciador de Credenciais do Windows.

Para arquitetura e configuração detalhada, consulte
[docs/ARQUITETURA.md](docs/ARQUITETURA.md) e
[docs/CONFIGURACAO.md](docs/CONFIGURACAO.md).
