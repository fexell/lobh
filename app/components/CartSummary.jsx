import {CartForm, Money} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router-dom';

/** @param {CartSummaryProps} */
export function CartSummary({cart, layout}) {
  const isAside = layout === 'aside';

  return (
    <>
      <style>{`
        .cs-wrap {
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Divider ── */
        .cs-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin-bottom: 24px;
          position: relative;
        }

        .cs-divider::after {
          content: '';
          position: absolute;
          left: 0; top: 0;
          width: 32px; height: 1px;
          background: #7AC9EF;
        }

        /* ── Subtotal row ── */
        .cs-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 6px;
        }

        .cs-row-label {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }

        .cs-row-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          color: #fff;
          letter-spacing: -0.01em;
        }

        /* ── Discount / gift card fields ── */
        .cs-field-wrap {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cs-field-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 2px;
        }

        .cs-field-row {
          display: flex;
          gap: 0;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .cs-field-row:focus-within {
          border-color: rgba(122,201,239,0.4);
        }

        .cs-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: none;
          outline: none;
          padding: 10px 14px;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 300;
          color: #fff;
          letter-spacing: 0.06em;
          min-width: 0;
        }

        .cs-input::placeholder {
          color: rgba(255,255,255,0.18);
        }

        .cs-field-btn {
          background: rgba(255,255,255,0.06);
          border: none;
          border-left: 1px solid rgba(255,255,255,0.08);
          padding: 10px 16px;
          font-family: 'Montserrat', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .cs-field-btn:hover {
          background: rgba(122,201,239,0.12);
          color: #7AC9EF;
        }

        .cs-field-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Applied code tag */
        .cs-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(122,201,239,0.08);
          border: 1px solid rgba(122,201,239,0.2);
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: #7AC9EF;
        }

        .cs-tag-remove {
          background: none;
          border: none;
          color: rgba(122,201,239,0.5);
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          transition: color 0.15s;
        }

        .cs-tag-remove:hover { color: #7AC9EF; }

        /* ── Checkout button ── */
        .cs-checkout {
          margin-top: 28px;
          display: block;
          width: 100%;
          padding: 16px 24px;
          background: #7AC9EF;
          color: #0d1a22;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-align: center;
          text-decoration: none;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }

        .cs-checkout:hover {
          background: #9dd8f4;
          transform: translateY(-1px);
        }

        .cs-checkout-note {
          margin-top: 12px;
          font-size: 10px;
          font-weight: 300;
          color: rgba(255,255,255,0.18);
          text-align: center;
          letter-spacing: 0.06em;
        }
      `}</style>

      <div className="cs-wrap px-4">
        <div className="cs-divider" />

        {/* Subtotal */}
        <div className="cs-row">
          <span className="cs-row-label">Delsumma</span>
          <span className="cs-row-value">
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart.cost.subtotalAmount} />
            ) : '—'}
          </span>
        </div>

        {/* Discount codes */}
        <CartDiscounts discountCodes={cart?.discountCodes} />

        {/* Gift cards */}
        {/* <CartGiftCard giftCardCodes={cart?.appliedGiftCards} /> */}

        {/* Checkout */}
        <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
      </div>
    </>
  );
}

/** @param {{checkoutUrl?: string}} */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;
  return (
    <>
      <a className="cs-checkout" href={checkoutUrl} target="_self">
        Fortsätt till kassan
      </a>
      <p className="cs-checkout-note">Frakt beräknas i kassan</p>
    </>
  );
}

/** @param {{ discountCodes?: CartApiQueryFragment['discountCodes'] }} */
function CartDiscounts({discountCodes}) {
  const codes =
    discountCodes
      ?.filter((d) => d.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="cs-field-wrap">
      {/* Applied codes */}
      {codes.length > 0 && (
        <UpdateDiscountForm>
          <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'4px'}}>
            {codes.map((code) => (
              <div key={code} className="cs-tag">
                <span>{code}</span>
                <button className="cs-tag-remove" type="submit" title="Ta bort">×</button>
              </div>
            ))}
          </div>
        </UpdateDiscountForm>
      )}

      {/* Input to add a code */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <div className="cs-field-label">Rabattkod</div>
          <div className="cs-field-row">
            <input
              className="cs-input"
              type="text"
              name="discountCode"
              placeholder="Ange kod..."
            />
            <button className="cs-field-btn" type="submit">Lägg till</button>
          </div>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

/** @param {{ discountCodes?: string[]; children: React.ReactNode }} */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

/** @param {{ giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined }} */
function CartGiftCard({giftCardCodes}) {
  const appliedGiftCardCodes = useRef([]);
  const giftCardCodeInput = useRef(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current.value = '';
    }
  }, [giftCardAddFetcher.data]);

  function saveAppliedCode(code) {
    const formattedCode = code.replace(/\s/g, '');
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
  }

  return (
    <div className="cs-field-wrap">
      {/* Applied gift cards */}
      {giftCardCodes?.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="cs-tag">
                <span>***{giftCard.lastCharacters}</span>
                <Money data={giftCard.amountUsed} />
                <button className="cs-tag-remove" type="submit" title="Ta bort">×</button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </div>
      )}

      {/* Input to add a gift card */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
        fetcherKey="gift-card-add"
      >
        <div>
          <div className="cs-field-label">Presentkort</div>
          <div className="cs-field-row">
            <input
              className="cs-input"
              type="text"
              name="giftCardCode"
              placeholder="Ange kod..."
              ref={giftCardCodeInput}
            />
            <button
              className="cs-field-btn"
              type="submit"
              disabled={giftCardAddFetcher.state !== 'idle'}
            >
              Lägg till
            </button>
          </div>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({giftCardCodes, saveAppliedCode, fetcherKey, children}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{giftCardCodes: giftCardCodes || []}}
    >
      {(fetcher) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) saveAppliedCode(code);
        return children;
      }}
    </CartForm>
  );
}

function RemoveGiftCardForm({giftCardId, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{giftCardCodes: [giftCardId]}}
    >
      {children}
    </CartForm>
  );
}

/**
 * @typedef {{ cart: OptimisticCart<CartApiQueryFragment | null>; layout: CartLayout; }} CartSummaryProps
 */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
/** @typedef {import('react-router').FetcherWithComponents} FetcherWithComponents */