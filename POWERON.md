# Ligar o ambiente depois de reiniciar o PC

Depois de instalar a tarefa automática uma vez, use este guia toda vez que
ligar o computador e quiser programar com o NVIDIA NIM no VS Code. A chave
continua guardada no Gerenciador de Credenciais do Windows; você não precisa
digitá-la de novo.

## 1. Abrir o VS Code

1. Abra o **Visual Studio Code** pelo menu Iniciar ou pelo atalho da área de
   trabalho.
2. Espere a janela terminar de carregar.

## 2. Abrir ou criar a pasta do projeto

Todo projeto fica dentro de uma pasta. Abra a pasta do projeto em que quer
trabalhar:

- **Se o projeto já existe:** no VS Code, clique em **File > Open Folder...**,
  escolha a pasta desse projeto e clique em **Select Folder**.
- **Se vai começar um projeto novo:** no VS Code, clique em **File > Open
  Folder...**, navegue até onde quer guardar seus projetos, clique em **New
  Folder**, dê um nome simples à pasta e selecione **Select Folder**.

Se o VS Code perguntar se confia nos arquivos dessa pasta, escolha **Yes, I
trust the authors** somente se você criou o projeto ou confia na origem dele.

> A pasta `NVIDIA + CLAUDE FREE` contém a ponte de conexão. Ela não é a pasta
> de todos os seus projetos. Abra a pasta do projeto em que quer programar;
> a ponte pode continuar aberta separadamente.

## 3. Primeira vez: ativar o início automático

Este passo é feito uma única vez. Ele agenda a ponte para iniciar quando você
entrar na sua conta do Windows:

1. No VS Code, abra **File > Open Folder...** e abra a pasta
   `H:\NVIDIA + CLAUDE FREE` (a pasta deste projeto).
2. Clique em **Terminal > New Terminal** e confirme que está usando PowerShell.
3. Execute:

```powershell
.\Install-NimBridgeStartup.ps1
```

4. Leia a confirmação no terminal. A tarefa usa sua conta normal do Windows,
   sem privilégios de administrador, e abre uma janela PowerShell minimizada.
5. Para a tarefa iniciar, saia da conta do Windows e entre novamente, ou
   reinicie o PC.

Esse agendamento é local ao seu Windows e não é enviado ao GitHub. Ele não
guarda a chave; a chave continua no Credential Manager.

> **Atenção:** com o início automático ativado, a ponte e o acesso local ao NIM
> ficam disponíveis durante sua sessão do Windows, mesmo quando você não está
> usando o VS Code. Desative o início automático se não quiser esse
> comportamento.

## 4. Depois de entrar no Windows

Após entrar na sua conta, o Windows inicia a ponte automaticamente em uma
janela PowerShell minimizada. Abra o VS Code e qualquer pasta de projeto.
Escolha **Continue > NVIDIA Nemotron 3.5 Super** e envie sua mensagem.

Procure a janela PowerShell minimizada se quiser conferir as mensagens da
ponte. Não inicie outra ponte na porta 8765 enquanto a automática estiver
rodando.

Se a janela não iniciou, ou se você ainda não configurou o início automático,
use o início manual abaixo.

## 5. Iniciar manualmente (alternativa)

1. No VS Code, clique em **Terminal > New Terminal**.
2. O terminal deve mostrar **PowerShell**.
3. Se abrir outro tipo de terminal, clique na seta ao lado do botão `+` do
   terminal e escolha **PowerShell**.

Na pasta deste projeto, execute a linha a seguir. Se o diretório do projeto for
outro, use o caminho completo indicado aqui:

```powershell
& "H:\NVIDIA + CLAUDE FREE\Start-NvidiaNimBridge.ps1"
```

Pressione **Enter** e espere aparecer:

```text
Local NVIDIA NIM bridge is ready at http://127.0.0.1:8765/v1.
```

**Deixe esse terminal aberto enquanto usar a IA.** Não feche essa aba e não
pressione `Ctrl+C` ainda. A ponte precisa continuar ligada para o Continue
conseguir conversar com a NVIDIA.

O inicializador lê a chave do Gerenciador de Credenciais do Windows. Se pedir
para você colar uma chave, pare: este inicializador não deve pedir isso.

## 6. Abrir o Continue e escolher o modelo

1. Na barra lateral do VS Code, clique em **Continue**.
2. No seletor de modelo, escolha **NVIDIA Nemotron 3.5 Super**.
3. Se o painel Continue não aparecer, pressione **Ctrl+Shift+P**, escreva
   `Continue: Focus Continue Chat` e pressione **Enter**.

## 7. Mandar uma mensagem de teste

No chat Continue, envie:

```text
Responda somente: NIM conectado.
```

Se o Continue responder, o ambiente está pronto. Para analisar o projeto
aberto, tente:

```text
Analise o projeto aberto. Explique a estrutura e os arquivos importantes.
Não modifique arquivos nem execute comandos. Se não conseguir ler algum
arquivo, diga qual.
```

Para pedir uma mudança depois, explique o que quer e revise o diff antes de
aceitar qualquer edição. Não aprove comandos ou exclusões que você não entenda.

## 8. Trabalhar em outro projeto

O Continue é instalado no VS Code e pode ser usado em pastas de projetos
diferentes. A ponte só precisa ser iniciada **uma vez por vez**:

1. Mantenha aberta a janela PowerShell minimizada da ponte. Se estiver usando
   o modo manual, mantenha aberto o terminal onde executou o inicializador.
2. Abra outra janela do VS Code com **File > New Window**.
3. Na nova janela, clique em **File > Open Folder...** e escolha a pasta do
   outro projeto.
4. Abra o Continue nessa janela e selecione **NVIDIA Nemotron 3.5 Super**.

Não inicie uma segunda ponte. Com o início automático, a mesma ponte atende
qualquer pasta de projeto durante a sessão atual do Windows.

## 9. Parar ou desativar a ponte

Para parar a ponte na sessão atual:

1. Restaure a janela PowerShell minimizada da ponte.
2. Clique dentro da janela.
3. Pressione **Ctrl+C**.

Isso para a ponte atual, mas ela inicia novamente no próximo login enquanto a
tarefa automática estiver ativada.

Para desativar o início automático:

1. Abra a pasta `H:\NVIDIA + CLAUDE FREE` no VS Code.
2. Abra **Terminal > New Terminal**.
3. Execute:

```powershell
.\Disable-NimBridgeStartup.ps1
```

O script impede inícios automáticos em futuros logins. Se a ponte já estiver
rodando agora, pare-a também com **Ctrl+C** na janela PowerShell minimizada.
Você pode reativar o início automático executando
`.\Install-NimBridgeStartup.ps1` novamente.

Ao reiniciar o PC, a tarefa inicia a ponte no login. A chave não precisa ser
criada novamente nem copiada para o projeto.

## Se algo não funcionar

### O terminal diz “Credential not found”

O Windows não encontrou a credencial. Abra o **Credential Manager** pelo menu
Iniciar, escolha **Windows Credentials > Generic Credentials** e confira se
existe:

- Endereço: `NVIDIA-NIM`
- Usuário: `NVIDIA_API_KEY`

Não envie a senha/chave em mensagens ou capturas de tela.

### O chat não responde

1. Confira se a janela PowerShell da ponte está aberta ou minimizada.
2. Confira se ela mostra `Local NVIDIA NIM bridge is ready`.
3. Confira se o Continue está usando **NVIDIA Nemotron 3.5 Super**.
4. Tente enviar novamente uma vez.

### A chave nunca foi guardada neste computador

Siga o [Passo 3 do tutorial do README](README.md#passo-3--guardar-a-chave-nvidia-no-windows)
uma vez. Depois execute o passo 3 deste guia para ativar o início automático,
ou inicie a ponte manualmente.

### Cline mostra erro `ByteString`

Use o painel **Continue** para NVIDIA NIM. O Cline instalado apresentou esse
erro neste ambiente.
