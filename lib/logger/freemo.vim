:syn keyword logCritical [CRI] nextgroup=skipheadCri
:syn match skipheadCri /[^>]\+>/ contained nextgroup=userlogCri
:syn match userlogCri /.*/ contained


:syn keyword logDbg [DBG] nextgroup=skipheadDbg
:syn match skipheadDbg /[^>]\+>/ contained nextgroup=userlogDbg
:syn match userlogDbg /.*/ contained


:syn keyword logInfo [INF] nextgroup=skipheadInf
:syn match skipheadInf /[^>]\+>/ contained nextgroup=userlogInf
:syn match userlogInf /.*/ contained


:syn keyword logError [ERR] nextgroup=skipheadErr
:syn match skipheadErr /[^>]\+>/ contained nextgroup=userlogErr
:syn match userlogErr /.*/ contained



hi link logCritical Error
hi link logDbg shOk
hi link logInfo Underlined
hi link logError Exception


hi link userlogCri Error
hi link userlogDbg shOk
hi link userlogInf Underlined
hi link userlogErr Exception

