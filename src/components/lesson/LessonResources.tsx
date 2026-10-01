import React from 'react'
import { Download, FileText, Archive, FileCode, FileSpreadsheet } from 'lucide-react'
import { LessonResource } from '../../types/lesson'

export interface LessonResourcesProps {
  resources: LessonResource[]
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <FileText className="w-4 h-4 text-rose-400" />
    case 'zip':
      return <Archive className="w-4 h-4 text-amber-400" />
    case 'code':
      return <FileCode className="w-4 h-4 text-[var(--accent)]" />
    default:
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
  }
}

export const LessonResources: React.FC<LessonResourcesProps> = ({ resources }) => {
  if (!resources || resources.length === 0) return null

  return (
    <section aria-labelledby="lesson-resources-heading" className="space-y-3 pt-2">
      <h3
        id="lesson-resources-heading"
        className="text-sm font-semibold text-[var(--text)] tracking-tight flex items-center gap-2"
      >
        <span>Lesson resources & downloads</span>
        <span className="text-xs font-mono text-[var(--muted)]">({resources.length})</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((res) => (
          <div
            key={res.id}
            data-testid={`resource-item-${res.id}`}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0 mr-2">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {getResourceIcon(res.type)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">
                  {res.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-[var(--muted)] border border-white/5">
                    {res.type}
                  </span>
                  <span className="text-[11px] text-[var(--muted)] font-mono">{res.size}</span>
                </div>
              </div>
            </div>

            <a
              href={res.url}
              download={res.name}
              data-testid={`download-resource-${res.id}`}
              aria-label={`Download ${res.name} (${res.size})`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-[var(--accent)] text-[var(--muted)] hover:text-[#04060d] border border-white/10 hover:border-transparent transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
