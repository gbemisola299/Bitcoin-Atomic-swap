;; Bitcoin Atomic Swap Contract
;; Enables trustless trading between BTC and STX/tokens

(define-constant ERR-EXPIRED (err u1))
(define-constant ERR-WRONG-SECRET (err u2))
(define-constant ERR-ALREADY-INITIALIZED (err u3))
(define-constant ERR-UNAUTHORIZED (err u4))

;; Data variables
(define-data-var contract-owner principal tx-sender)
(define-data-var swap-initialized bool false)
(define-data-var hash-lock (buff 32) 0x)
(define-data-var timelock uint u0)
(define-data-var stx-amount uint u0)
(define-data-var recipient principal tx-sender)

;; Read-only functions
(define-read-only (get-swap-details)
    (ok {
        initialized: (var-get swap-initialized),
        hash: (var-get hash-lock),
        deadline: (var-get timelock),
        amount: (var-get stx-amount),
        swap-recipient: (var-get recipient)
    })
)

;; Initialize swap
(define-public (initialize-swap 
    (hash (buff 32)) 
    (deadline uint) 
    (amount uint)
    (swap-recipient principal))
    (begin
        (asserts! (not (var-get swap-initialized)) ERR-ALREADY-INITIALIZED)
        (asserts! (> deadline block-height) ERR-EXPIRED)
        
        (var-set hash-lock hash)
        (var-set timelock deadline)
        (var-set stx-amount amount)
        (var-set recipient swap-recipient)
        (var-set swap-initialized true)
        
        ;; Lock the STX
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (ok true)
    )
)

;; Claim funds with secret
(define-public (claim-with-secret (secret (buff 32)))
    (begin
        (asserts! (var-get swap-initialized) ERR-UNAUTHORIZED)
        (asserts! (<= block-height (var-get timelock)) ERR-EXPIRED)
        (asserts! (is-eq (sha256 secret) (var-get hash-lock)) ERR-WRONG-SECRET)
        
        ;; Transfer STX to recipient
        (try! (as-contract (stx-transfer? 
            (var-get stx-amount)
            tx-sender
            (var-get recipient))))
            
        ;; Reset contract state
        (var-set swap-initialized false)
        (ok true)
    )
)
