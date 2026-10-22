# Configuração e validação

Para instalar e iniciar pela primeira vez, siga o
[tutorial passo a passo do README](../README.md).

## 1. Credencial NVIDIA

No Gerenciador de Credenciais do Windows, crie uma credencial genérica:

- Endereço de rede ou Internet: `NVIDIA-NIM`
- Nome de usuário: `NVIDIA_API_KEY`
- Senha: a chave obtida no portal NVIDIA.

Não compartilhe a chave. O inicializador espera exatamente esse destino e
usuário; em caso de ausência ou incompatibilidade, encerra antes de iniciar o
servidor.

## 2. Início automático ou manual

Para iniciar a ponte automaticamente ao entrar na sua conta do Windows,
execute uma vez no PowerShell, aberto na pasta deste projeto:

```powershell
.\Install-NimBridgeStartup.ps1
```

A tarefa roda com a conta atual e privilégios limitados, sem exigir
administrador. Ela inicia no próximo login em uma janela PowerShell
minimizada. A chave não é copiada nem gravada pela tarefa.

Essa opção mantém a ponte disponível durante toda a sessão do Windows. Se
preferir desativar os próximos inícios automáticos:

```powershell
.\Disable-NimBridgeStartup.ps1
```

O script desativa a tarefa, mas não encerra a ponte que já está rodando.
Restaure a janela PowerShell minimizada e pressione `Ctrl+C` para pará-la.

Se não quiser o início automático, ligue a ponte manualmente:

No PowerShell integrado do VS Code, neste diretório, execute:

```powershell
.\Start-NvidiaNimBridge.ps1
```

Uma inicialização válida mostra que a ponte está pronta em
`http://127.0.0.1:8765/v1`. Mantenha o terminal aberto. `Ctrl+C` para a ponte
e remove a variável de ambiente temporária do processo PowerShell.

## 3. Continue

Continue 2.0.0 foi instalado e configurado no perfil do usuário em
`%USERPROFILE%\.continue\config.yaml`. O modelo é **NVIDIA Nemotron 3.5
Super** e usa a ponte em `http://127.0.0.1:8765/v1`. A configuração contém
somente `local-nvidia-bridge`, nunca a chave NVIDIA.

Se o Continue ainda não mostrar o modelo:

1. Abra a Paleta de Comandos com `Ctrl+Shift+P`.
2. Execute **Developer: Reload Window**.
3. Abra o painel Continue e selecione **NVIDIA Nemotron 3.5 Super**.

## 4. Cline (limitação conhecida)

O Cline 4.1.25 está instalado e foi apontado para os mesmos valores:

| Campo | Valor |
| --- | --- |
| Base URL | `http://127.0.0.1:8765/v1` |
| API Key | `local-nvidia-bridge` |
| Model ID | `nvidia/nemotron-3.5-super-vl-120b-a12b` |

O campo API Key do Cline contém somente o identificador local não secreto.
Não coloque a chave NVIDIA real nele.

No ambiente testado, o Cline apresentou `Cannot convert argument to a
ByteString ... 8212` ao enviar mensagens curtas, inclusive ASCII. A filtragem
do campo separado `reasoning_content` na ponte não resolveu esse erro, por
isso a causa não está confirmada. Um relato público semelhante está em
[cline/cline#11163](https://github.com/cline/cline/issues/11163). Use o
Continue como agente de programação até a compatibilidade do Cline ser
confirmada.

## 5. Teste de análise de arquivo

Com a ponte em execução e o Continue aberto, solicite:

> Abra `examples/agent-smoke-test.js`, explique o que ele faz e indique uma
> entrada de borda. Não edite o arquivo nem execute comandos.

Confirme que a resposta do Continue se refere ao conteúdo do arquivo. Depois,
revise qualquer proposta de edição no painel de diff antes de aceitá-la.

## Diagnóstico

- **Credential not found**: confirme destino `NVIDIA-NIM` no Credential
  Manager.
- **Unexpected username**: o nome de usuário da credencial deve ser
  `NVIDIA_API_KEY`.
- **Could not start / EADDRINUSE**: a porta local 8765 já está ocupada; não
  encerre processos desconhecidos. Investigue antes de mudar a porta.
- **401 no endpoint NIM**: a chave pode estar incorreta, revogada ou não
  autorizada para esse serviço. Não a envie por chat; corrija-a pelo portal
  NVIDIA e atualize a credencial no Credential Manager.
- **401 local**: confira se o campo API Key do Cline está exatamente como
  `local-nvidia-bridge`.
- **404 local**: confirme a Base URL e o sufixo `/v1`.
- **Falha de conexão**: verifique se o terminal da ponte continua aberto e se
  a rede permite HTTPS para `integrate.api.nvidia.com`.

## Estado verificado até agora

- Uma solicitação real de texto ao endpoint NVIDIA respondeu com sucesso.
- Uma solicitação real através da ponte local também respondeu com sucesso.
- A ponte rejeitou uma solicitação sem a chave local (HTTP 401).
- Um teste real de streaming confirmou que a ponte remove o campo
  `reasoning_content` antes de encaminhar eventos SSE; isso não resolveu o
  erro de codificação do Cline.
- A API retornou `private/nvidia/nemotron-3.5-super-120b-a12b` como identificador
  de serviço para a solicitação do modelo público
  `nvidia/nemotron-3.5-super-vl-120b-a12b`.
- Continue 2.0.0 foi instalado e configurado para a ponte; a análise de
  `examples/agent-smoke-test.js` foi validada no VS Code. O agente descreveu
  corretamente o uso de `trim()` e a saudação e identificou `null`/`undefined`
  como entradas que causam `TypeError`.
- O teste de chat mínimo no Continue respondeu com sucesso pelo modelo NVIDIA.
- Chamadas de ferramentas/edições do Continue ainda precisam de validação
  separada; nenhuma edição foi aceita nesse teste.
- Cline 4.1.25 falhou no teste de tarefa com erro Unicode e não foi aprovado.
