import {Link} from 'react-router-dom';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {useVariantUrl} from '~/lib/variants';

export function ProductForm({product, selectedVariant, variants}) {
  const {open} = useAside();

  return (
    <>
      <style>{`
        .pf-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 28px;
        }
        .pf-option-name {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin-bottom: 10px;
        }
        .pf-option-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pf-option-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          padding: 8px 16px;
          border-radius: 3px;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.6);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .pf-option-item:hover {
          border-color: rgba(122,201,239,0.4);
          color: #fff;
          background: rgba(122,201,239,0.08);
        }
        .pf-option-item.is-selected {
          border-color: #7AC9EF;
          color: #fff;
          background: rgba(122,201,239,0.1);
        }
        .pf-option-item.is-unavailable {
          opacity: 0.28;
          cursor: not-allowed;
          pointer-events: none;
        }
        .pf-atc {
          width: 100%;
          padding: 16px 32px;
          background: #7AC9EF;
          color: #0d1a22;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: block;
        }
        .pf-atc:hover:not(:disabled) {
          background: #9dd8f4;
          transform: translateY(-1px);
        }
        .pf-atc:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>

      <div className="pf-options">
        {product.options.map((option) => {
          if (option.values.length === 1) return null;
          return (
            <div key={option.name}>
              <div className="pf-option-name">{option.name}</div>
              <div className="pf-option-grid">
                {option.values.map((value) => {
                  const matchingVariant = variants.find((v) =>
                    v.selectedOptions.some(
                      (o) => o.name === option.name && o.value === value,
                    ),
                  );
                  const isSelected = selectedVariant?.selectedOptions.some(
                    (o) => o.name === option.name && o.value === value,
                  );
                  const isAvailable = matchingVariant?.availableForSale ?? false;
                  const itemClass = ['pf-option-item', isSelected ? 'is-selected' : '', !isAvailable ? 'is-unavailable' : ''].filter(Boolean).join(' ');

                  if (matchingVariant) {
                    return (
                      <OptionLink key={value} handle={product.handle} variant={matchingVariant} className={itemClass}>
                        {value}
                      </OptionLink>
                    );
                  }
                  return <span key={value} className={`${itemClass} is-unavailable`}>{value}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AddToCartButton
        className="pf-atc"
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        lines={selectedVariant ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}] : []}
      >
        {selectedVariant?.availableForSale ? 'Lägg till i kundvagn' : 'Utsålt'}
      </AddToCartButton>
    </>
  );
}

function OptionLink({handle, variant, className, children}) {
  const variantUrl = useVariantUrl(handle, variant.selectedOptions);
  return (
    <Link className={className} prefetch="intent" preventScrollReset replace to={variantUrl}>
      {children}
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */