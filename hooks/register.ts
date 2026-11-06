import type { Register } from 'claude-code'

// Caminhos comparados em minúsculas e com "/" (no Windows as duas barras valem).
const normal = (s: string) => s.toLowerCase().replace(/\\/g, '/')

// verbos que apagam, movem, renomeiam ou sobrescrevem (bash, PowerShell, cmd e Python inline);
// a última parte pega redirecionar a saída para um arquivo (não pega 2>&1)
const MEXE = /\b(rm|rmdir|mv|del|erase|rd|move|ren|rename|remove-item|move-item|rename-item|set-content|out-file|clear-content|robocopy|unlink|shred|truncate|rmtree|os\.remove|shutil\.move|deletefile|deletedirectory|movefile|movedirectory|sed\s+-i)\b|(^|[^0-9&>])>{1,2}\s*[^&\s]/i

// exclusão permanente (sem passar pela Lixeira)
const APAGA = /(^|[\s;&|(])(rm|rmdir|del|erase|rd|remove-item|ri|unlink|shred)\b|shutil\.rmtree|os\.remove|os\.unlink|\[system\.io\.(file|directory)\]::delete|-delete\b/i
// lugares temporários onde apagar de vez é normal
const TEMPORARIO = /appdata[\\/]local[\\/]temp|[\\/]tmp[\\/]|\/tmp\b|scratchpad|node_modules|__pycache__/i

const negar = (motivo: string) => ({ deny: `trava-pastas: ${motivo}` })

export const register: Register = (on, options) => {
  const protegidas = String(options.pastas ?? '')
    .split(';')
    .map(p => normal(p.trim()).replace(/\/+$/, ''))
    .filter(p => p.length >= 3)
  const bloquearExclusao = options.bloquearExclusao !== false
  const toca = (s: string) => {
    const n = normal(s)
    return protegidas.find(p => n.includes(p))
  }

  const guardaArquivo = (caminho: string) => {
    const p = toca(caminho)
    return p ? negar(`${caminho} está numa pasta protegida (${p}); não pode ser alterado.`) : undefined
  }
  const guardaComando = (cmd: string) => {
    const p = toca(cmd)
    if (p && MEXE.test(cmd))
      return negar(`o comando apagaria, moveria ou alteraria uma pasta protegida (${p}). Só leitura ou cópia são permitidas ali.`)
    if (bloquearExclusao && APAGA.test(cmd) && !TEMPORARIO.test(cmd))
      return negar('exclusão permanente bloqueada. Mande para a Lixeira ou mova para uma pasta "_para_apagar" e apague você mesmo.')
    return undefined
  }
  const falhou = negar('a verificação falhou; ação bloqueada por segurança.')

  on('tool.call', { tool: 'Edit' }, ($, e, next) => guardaArquivo(e.file_path) ?? next(e))
    .catch(($, e, next) => (next.called ? next(e) : falhou))
  on('tool.call', { tool: 'Write' }, ($, e, next) => guardaArquivo(e.file_path) ?? next(e))
    .catch(($, e, next) => (next.called ? next(e) : falhou))
  on('tool.call', { tool: 'NotebookEdit' }, ($, e, next) => guardaArquivo(e.notebook_path) ?? next(e))
    .catch(($, e, next) => (next.called ? next(e) : falhou))
  on('tool.call', { tool: 'Bash' }, ($, e, next) => guardaComando(e.command) ?? next(e))
    .catch(($, e, next) => (next.called ? next(e) : falhou))
  on('tool.call', { tool: 'PowerShell' }, ($, e, next) => guardaComando(e.command) ?? next(e))
    .catch(($, e, next) => (next.called ? next(e) : falhou))
}
