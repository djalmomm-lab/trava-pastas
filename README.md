# trava-pastas

Mod para o Claude Code que **impede o Claude de apagar, mover ou alterar as pastas e arquivos que você protege**, e de **apagar arquivos de vez** sem passar pela Lixeira.

Útil para quem guarda documentos importantes (contratos, provas, backups, fotos) no mesmo computador em que usa o Claude Code.

## O que ele bloqueia

- **Edit / Write / NotebookEdit** em qualquer arquivo dentro de um caminho protegido.
- **Bash / PowerShell** que apaguem, movam, renomeiem ou sobrescrevam algo num caminho protegido (`rm`, `mv`, `del`, `Remove-Item`, `Move-Item`, `robocopy`, `sed -i`, redirecionar saída com `>` etc.).
- **Exclusão permanente** (`rm`, `del`, `Remove-Item`, `shutil.rmtree`...) fora de pastas temporárias, se a opção estiver ligada. O Claude passa a mandar para a Lixeira ou para uma pasta que você apaga depois.

Ler e copiar continua liberado. A trava é de propósito rígida: um comando que só *cita* um caminho protegido junto de um verbo destrutivo também é barrado.

## Instalação

No prompt de uma sessão do Claude Code no terminal:

```
/plugin install trava-pastas --marketplace djalmomm-lab/trava-pastas
```

Responda `y` para adicionar o marketplace e escolha o escopo (usuário, para valer em todas as sessões).

Pelo shell:

```
claude plugin install trava-pastas --marketplace djalmomm-lab/trava-pastas
```

## Configuração

Na instalação (ou depois, em `/config`), preencha:

- **Pastas e arquivos protegidos**: caminhos ou trechos de caminho separados por ponto e vírgula.
  Ex.: `C:/Users/voce/documentos/contratos; fotos-familia; backup-2026.zip`
- **Bloquear exclusão permanente**: ligado por padrão.

Nenhum caminho vem configurado: cada pessoa protege as próprias pastas, e elas ficam só nas suas configurações locais.

## Limites

É uma trava de segurança para o assistente, não um antivírus nem um backup. Mantenha cópias dos arquivos importantes em outro lugar.
