import {CartForm} from '@shopify/hydrogen';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCartShopping} from '@fortawesome/free-solid-svg-icons';
import {clsx} from 'clsx';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   className?: string;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  className,
  disabled,
  lines,
  onClick,
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => {
        const isDisabled = disabled ?? fetcher.state !== 'idle';

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              className={className ?? clsx(
                'pf-atc',
                { 'pf-atc--disabled': isDisabled }
              )}
              onClick={onClick}
              disabled={isDisabled}
            >
              <FontAwesomeIcon icon={faCartShopping} className="mr-2" />
              {children}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}

/** @typedef {import('react-router').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */