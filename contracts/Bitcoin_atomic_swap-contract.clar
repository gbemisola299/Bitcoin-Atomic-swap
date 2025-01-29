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
