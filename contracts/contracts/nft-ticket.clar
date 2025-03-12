;; NFT Ticket - Event Certification NFTs
;; Implementation of SIP009 NFT standard with non-transferable property

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define the NFT
(define-non-fungible-token event-ticket uint)

;; Data variables
(define-data-var last-token-id uint u0)

;; Data maps for token metadata
(define-map token-uris uint (string-ascii 256))

;; Constants
(define-constant contract-owner tx-sender)

;; Error codes
(define-constant err-owner-only (err u100))
(define-constant err-not-transferable (err u101))
(define-constant err-invalid-uri (err u102))
(define-constant err-self-transfer (err u103))

;; SIP009: Get last token ID
(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

;; SIP009: Get token URI
(define-read-only (get-token-uri (token-id uint))
    (ok (map-get? token-uris token-id))
)

;; SIP009: Get owner
(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? event-ticket token-id))
)

;; SIP009: Transfer token - Always fails as tickets are non-transferable
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin 
        (asserts! false err-not-transferable)
        (ok false)
    )
)

;; Mint new ticket certificate
(define-public (mint (recipient principal) (metadata-uri (string-ascii 256)))
    (let
        (
            (token-id (+ (var-get last-token-id) u1))
        )
        ;; Check that sender is contract owner
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        ;; Check that recipient is not null
        (asserts! (not (is-eq recipient tx-sender)) err-self-transfer)
        ;; Check that URI is not empty
        (asserts! (not (is-eq metadata-uri "")) err-invalid-uri)
        ;; Mint the token
        (try! (nft-mint? event-ticket token-id recipient))
        ;; Store metadata URI
        (map-set token-uris token-id metadata-uri)
        ;; Update last token ID
        (var-set last-token-id token-id)
        (ok token-id)
    )
)
