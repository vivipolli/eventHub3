;; NFT Collectibles - Special Event NFTs
;; Implementation of SIP009 NFT standard

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define the NFT
(define-non-fungible-token nft-collectible uint)

;; Data variables
(define-data-var last-token-id uint u0)

;; Data maps for token metadata
(define-map token-uris uint (string-ascii 256))

;; Constants
(define-constant contract-owner tx-sender)

;; Error codes
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-invalid-token (err u102))
(define-constant err-invalid-uri (err u103))
(define-constant err-self-transfer (err u104))

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
    (ok (nft-get-owner? nft-collectible token-id))
)

;; SIP009: Transfer token
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        ;; Check that token exists
        (asserts! (is-some (nft-get-owner? nft-collectible token-id)) err-invalid-token)
        ;; Check that sender owns the token
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
        ;; Prevent self-transfers
        (asserts! (not (is-eq sender recipient)) err-self-transfer)
        ;; Transfer the token
        (nft-transfer? nft-collectible token-id sender recipient)
    )
)

;; Mint new collectible
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
        (try! (nft-mint? nft-collectible token-id recipient))
        ;; Store metadata URI
        (map-set token-uris token-id metadata-uri)
        ;; Update last token ID
        (var-set last-token-id token-id)
        (ok token-id)
    )
)
