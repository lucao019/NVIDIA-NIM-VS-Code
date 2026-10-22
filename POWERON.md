# Ligar o ambiente depois de reiniciar o PC

Use este guia toda vez que ligar o computador e quiser programar com o
NVIDIA NIM no VS Code. A chave continua guardada no Gerenciador de Credenciais
do Windows; você não precisa digitá-la de novo.

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

## 3. Abrir um terminal PowerShell

1. No VS Code, clique em **Terminal > New Terminal**.
2. O terminal deve mostrar **PowerShell**.
3. Se abrir outro tipo de terminal, clique na seta ao lado do botão `+` do
   terminal e escolha **PowerShell**.

## 4. Iniciar a ponte NVIDIA

Na janela do terminal, copie e execute esta linha:

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

## 5. Abrir o Continue e escolher o modelo

1. Na barra lateral do VS Code, clique em **Continue**.
2. No seletor de modelo, escolha **NVIDIA Nemotron 3.5 Super**.
3. Se o painel Continue não aparecer, pressione **Ctrl+Shift+P**, escreva
   `Continue: Focus Continue Chat` e pressione **Enter**.

## 6. Mandar uma mensagem de teste

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

## 7. Trabalhar em outro projeto

O Continue é instalado no VS Code e pode ser usado em pastas de projetos
diferentes. A ponte só precisa ser iniciada **uma vez por vez**:

1. Mantenha aberta a janela do VS Code com o terminal da ponte.
2. Abra outra janela do VS Code com **File > New Window**.
3. Na nova janela, clique em **File > Open Folder...** e escolha a pasta do
   outro projeto.
4. Abra o Continue nessa janela e selecione **NVIDIA Nemotron 3.5 Super**.

Não inicie uma segunda ponte. Se fechar a janela/terminal onde a ponte está
rodando, inicie-a novamente seguindo o passo 4.

## 8. Encerrar com segurança

Quando terminar:

1. Volte à janela que mostra `Local NVIDIA NIM bridge is ready`.
2. Clique dentro do terminal dessa janela.
3. Pressione **Ctrl+C**.
4. A mensagem de servidor pronto deve parar. Agora pode fechar o VS Code.

Ao reiniciar o PC, basta repetir os passos deste guia. Você não precisa criar
outra chave NVIDIA nem copiar a chave para o projeto.

## Se algo não funcionar

### O terminal diz “Credential not found”

O Windows não encontrou a credencial. Abra o **Credential Manager** pelo menu
Iniciar, escolha **Windows Credentials > Generic Credentials** e confira se
existe:

- Endereço: `NVIDIA-NIM`
- Usuário: `NVIDIA_API_KEY`

Não envie a senha/chave em mensagens ou capturas de tela.

### O chat não responde

1. Confira se o terminal da ponte ainda está aberto.
2. Confira se aparece nele `Local NVIDIA NIM bridge is ready`.
3. Confira se o Continue está usando **NVIDIA Nemotron 3.5 Super**.
4. Tente enviar novamente uma vez.

### A chave nunca foi guardada neste computador

Siga o [Passo 3 do tutorial do README](README.md#passo-3--guardar-a-chave-nvidia-no-windows)
uma vez. Depois volte ao passo 4 deste guia.

### Cline mostra erro `ByteString`

Use o painel **Continue** para NVIDIA NIM. O Cline instalado apresentou esse
erro neste ambiente.
