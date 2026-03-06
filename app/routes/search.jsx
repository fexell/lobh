import {json} from '@netlify/remix-runtime';
import {useLoaderData, Link} from '@remix-run/react';
import {getPaginationVariables, Analytics, Image, Money} from '@shopify/hydrogen';
import {SearchForm} from '~/components/SearchForm';
import {SearchResults} from '~/components/SearchResults';
import {getEmptyPredictiveSearchResult} from '~/lib/search';
import {useTheme} from '~/components/PageLayout';

/** @type {MetaFunction} */
export const meta = () => [{title: 'Sök | Butiken'}];

/** @param {LoaderFunctionArgs} */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const searchPromise = isPredictive
    ? predictiveSearch({request, context})
    : regularSearch({request, context});

  searchPromise.catch((error) => {
    console.error(error);
    return {term: '', result: null, error: error.message};
  });

  return json(await searchPromise);
}

export default function SearchPage() {
  const {type, term, result, error} = useLoaderData();
  const {theme} = useTheme();
  if (type === 'predictive') return null;

  const hasResults = term && result?.total > 0;

  return (
    <>
      <style>{`
        /* ── Theme variables ── */
        .srch-page[data-theme="dark"] {
          --srch-bg:                #111;
          --srch-bg-header:         #141414;
          --srch-bg-card:           #1a1a1a;
          --srch-bg-card-hover:     #1e1e1e;
          --srch-bg-card-img:       #141414;
          --srch-bg-card-noimg:     #181818;
          --srch-heading:           #fff;
          --srch-text:              rgba(255,255,255,0.7);
          --srch-text-hover:        #fff;
          --srch-border:            rgba(255,255,255,0.06);
          --srch-border-card:       rgba(255,255,255,0.04);
          --srch-accent:            #7AC9EF;
          --srch-accent-text:       #0d1a22;
          --srch-accent-hover:      #9dd8f4;
          --srch-noimg-icon:        rgba(122,201,239,0.1);
          --srch-input-bg:          rgba(255,255,255,0.04);
          --srch-input-color:       #fff;
          --srch-input-placeholder: rgba(255,255,255,0.2);
          --srch-input-border:      rgba(255,255,255,0.1);
          --srch-input-border-focus:rgba(122,201,239,0.5);
          --srch-meta-color:        rgba(255,255,255,0.25);
          --srch-meta-strong:       rgba(255,255,255,0.55);
          --srch-list-type:         rgba(255,255,255,0.2);
          --srch-empty-icon:        rgba(255,255,255,0.05);
          --srch-empty-title:       rgba(255,255,255,0.3);
          --srch-empty-sub:         rgba(255,255,255,0.18);
          --srch-error-bg:          rgba(239,68,68,0.08);
          --srch-error-border:      rgba(239,68,68,0.2);
          --srch-error-color:       rgba(239,68,68,0.8);
        }

        .srch-page[data-theme="light"] {
          --srch-bg:                #f5f5f3;
          --srch-bg-header:         #ebebea;
          --srch-bg-card:           #fff;
          --srch-bg-card-hover:     #f9f9f8;
          --srch-bg-card-img:       #e8e8e6;
          --srch-bg-card-noimg:     #f0f0ee;
          --srch-heading:           #111;
          --srch-text:              rgba(30,30,30,0.7);
          --srch-text-hover:        #111;
          --srch-border:            rgba(0,0,0,0.07);
          --srch-border-card:       rgba(0,0,0,0.05);
          --srch-accent:            #2a8ab5;
          --srch-accent-text:       #fff;
          --srch-accent-hover:      #1d6a8a;
          --srch-noimg-icon:        rgba(42,138,181,0.12);
          --srch-input-bg:          rgba(0,0,0,0.02);
          --srch-input-color:       #111;
          --srch-input-placeholder: rgba(30,30,30,0.25);
          --srch-input-border:      rgba(0,0,0,0.12);
          --srch-input-border-focus:rgba(42,138,181,0.5);
          --srch-meta-color:        rgba(30,30,30,0.35);
          --srch-meta-strong:       rgba(30,30,30,0.65);
          --srch-list-type:         rgba(30,30,30,0.25);
          --srch-empty-icon:        rgba(0,0,0,0.05);
          --srch-empty-title:       rgba(30,30,30,0.3);
          --srch-empty-sub:         rgba(30,30,30,0.2);
          --srch-error-bg:          rgba(239,68,68,0.06);
          --srch-error-border:      rgba(239,68,68,0.18);
          --srch-error-color:       rgba(200,40,40,0.85);
        }

        /* ── Base ── */
        .srch-page {
          background: var(--srch-bg);
          min-height: calc(100vh - 110px);
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* ── Header ── */
        .srch-header {
          background: var(--srch-bg-header);
          border-bottom: 1px solid var(--srch-border);
          padding: 64px 48px 48px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .srch-header { padding: 48px 24px 36px; }
        }

        .srch-header-inner {
          max-width: 800px;
          margin: 0 auto;
        }

        .srch-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--srch-accent);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .srch-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--srch-accent);
        }

        .srch-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 300;
          color: var(--srch-heading);
          margin: 0 0 32px;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        /* ── Search input ── */
        .srch-form-wrap {
          display: flex;
          gap: 0;
          border: 1px solid var(--srch-input-border);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .srch-form-wrap:focus-within {
          border-color: var(--srch-input-border-focus);
        }

        .srch-input {
          flex: 1;
          background: var(--srch-input-bg);
          border: none;
          outline: none;
          padding: 16px 20px;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: var(--srch-input-color);
          letter-spacing: 0.04em;
        }

        .srch-input::placeholder {
          color: var(--srch-input-placeholder);
        }

        .srch-submit {
          background: var(--srch-accent);
          border: none;
          padding: 0 28px;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--srch-accent-text);
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .srch-submit:hover {
          background: var(--srch-accent-hover);
        }

        /* ── Body ── */
        .srch-body {
          flex: 1;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 56px 48px 96px;
        }

        @media (max-width: 768px) {
          .srch-body { padding: 40px 24px 72px; }
        }

        /* ── Results meta line ── */
        .srch-meta {
          font-size: 11px;
          font-weight: 300;
          color: var(--srch-meta-color);
          letter-spacing: 0.08em;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--srch-border);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .srch-meta strong {
          color: var(--srch-meta-strong);
          font-weight: 500;
        }

        /* ── Section heading ── */
        .srch-section-heading {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--srch-accent);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          margin-top: 48px;
        }

        .srch-section-heading:first-child { margin-top: 0; }

        .srch-section-heading::before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background: var(--srch-accent);
        }

        /* ── Product grid ── */
        .srch-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          margin-bottom: 48px;
        }

        @media (max-width: 1024px) {
          .srch-products-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 640px) {
          .srch-products-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .srch-product-card {
          display: block;
          text-decoration: none;
          background: var(--srch-bg-card);
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }

        .srch-product-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--srch-accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          z-index: 1;
        }

        .srch-product-card:hover { background: var(--srch-bg-card-hover); }
        .srch-product-card:hover::before { transform: scaleX(1); }

        .srch-product-img {
          aspect-ratio: 1/1;
          overflow: hidden;
          background: var(--srch-bg-card-img);
        }

        .srch-product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }

        .srch-product-card:hover .srch-product-img img {
          transform: scale(1.05);
        }

        .srch-product-info {
          padding: 16px 18px 20px;
          border-top: 1px solid var(--srch-border-card);
        }

        .srch-product-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--srch-text);
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }

        .srch-product-card:hover .srch-product-title { color: var(--srch-text-hover); }

        .srch-product-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 300;
          color: var(--srch-accent);
        }

        /* ── Pages / Articles list ── */
        .srch-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 48px;
        }

        .srch-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--srch-bg-card);
          text-decoration: none;
          transition: background 0.2s;
          gap: 16px;
        }

        .srch-list-item:hover { background: var(--srch-bg-card-hover); }

        .srch-list-title {
          font-size: 13px;
          font-weight: 300;
          color: var(--srch-text);
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }

        .srch-list-item:hover .srch-list-title { color: var(--srch-text-hover); }

        .srch-list-type {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--srch-list-type);
          flex-shrink: 0;
        }

        /* ── Empty / no results ── */
        .srch-empty {
          text-align: center;
          padding: 80px 24px;
        }

        .srch-empty-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 72px;
          color: var(--srch-empty-icon);
          line-height: 1;
          margin-bottom: 24px;
        }

        .srch-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: var(--srch-empty-title);
          margin-bottom: 10px;
        }

        .srch-empty-sub {
          font-size: 11px;
          font-weight: 300;
          color: var(--srch-empty-sub);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Error ── */
        .srch-error {
          padding: 20px 24px;
          background: var(--srch-error-bg);
          border: 1px solid var(--srch-error-border);
          border-radius: 3px;
          font-size: 12px;
          color: var(--srch-error-color);
          margin-bottom: 32px;
          letter-spacing: 0.03em;
        }
      `}</style>

      <div className="srch-page" data-theme={theme}>

        {/* Header */}
        <div className="srch-header">
          <div className="srch-header-inner">
            <div className="srch-label">Sök</div>
            <h1 className="srch-title">
              {term ? <>Resultat för <em style={{fontStyle:'italic'}}>"{term}"</em></> : 'Sök i butiken'}
            </h1>

            <SearchForm>
              {({inputRef}) => (
                <div className="srch-form-wrap">
                  <input
                    className="srch-input"
                    defaultValue={term}
                    name="q"
                    placeholder="Sök efter produkter, sidor..."
                    ref={inputRef}
                    type="search"
                    autoComplete="off"
                  />
                  <button className="srch-submit" type="submit">Sök</button>
                </div>
              )}
            </SearchForm>
          </div>
        </div>

        {/* Results body */}
        <div className="srch-body">

          {error && <div className="srch-error">{error}</div>}

          {!term ? (
            <div className="srch-empty">
              <div className="srch-empty-icon">✦</div>
              <div className="srch-empty-title">Vad letar du efter?</div>
              <div className="srch-empty-sub">Skriv något i sökfältet ovan</div>
            </div>
          ) : !hasResults ? (
            <div className="srch-empty">
              <div className="srch-empty-icon">∅</div>
              <div className="srch-empty-title">Inga resultat hittades</div>
              <div className="srch-empty-sub">Prova ett annat sökord</div>
            </div>
          ) : (
            <>
              <div className="srch-meta">
                Hittade <strong>{result.total}</strong> {result.total === 1 ? 'resultat' : 'resultat'} för &ldquo;{term}&rdquo;
              </div>

              <SearchResults result={result} term={term}>
                {({articles, pages, products, term}) => (
                  <div>
                    {/* Products */}
                    {products?.nodes?.length > 0 && (
                      <>
                        <div className="srch-section-heading">Produkter</div>
                        <div className="srch-products-grid">
                          {products.nodes.map((product) => {
                            const variant = product.variants.nodes[0];
                            return (
                              <Link
                                key={product.id}
                                className="srch-product-card"
                                to={`/products/${product.handle}`}
                                prefetch="intent"
                              >
                                <div className="srch-product-img">
                                  {variant?.image ? (
                                    <Image
                                      data={variant.image}
                                      aspectRatio="1/1"
                                      sizes="(min-width: 45em) 300px, 50vw"
                                    />
                                  ) : (
                                    <div style={{width:'100%',height:'100%',background:'var(--srch-bg-card-noimg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'40px',color:'var(--srch-noimg-icon)'}}>✦</span>
                                    </div>
                                  )}
                                </div>
                                <div className="srch-product-info">
                                  <div className="srch-product-title">{product.title}</div>
                                  {variant?.price && (
                                    <div className="srch-product-price">
                                      <Money data={variant.price} />
                                    </div>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Pages */}
                    {pages?.nodes?.length > 0 && (
                      <>
                        <div className="srch-section-heading">Sidor</div>
                        <div className="srch-list">
                          {pages.nodes.map((page) => (
                            <Link
                              key={page.id}
                              className="srch-list-item"
                              to={`/pages/${page.handle}`}
                              prefetch="intent"
                            >
                              <span className="srch-list-title">{page.title}</span>
                              <span className="srch-list-type">Sida</span>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Articles */}
                    {articles?.nodes?.length > 0 && (
                      <>
                        <div className="srch-section-heading">Artiklar</div>
                        <div className="srch-list">
                          {articles.nodes.map((article) => (
                            <Link
                              key={article.id}
                              className="srch-list-item"
                              to={`/blogs/${article.blog?.handle ?? 'news'}/${article.handle}`}
                              prefetch="intent"
                            >
                              <span className="srch-list-title">{article.title}</span>
                              <span className="srch-list-type">Artikel</span>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </SearchResults>
            </>
          )}
        </div>

        <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
      </div>
    </>
  );
}

/* ─── GraphQL (unchanged) ─────────────────────────────────────────────── */

const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    variants(first: 1) {
      nodes {
        id
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        product {
          handle
          title
        }
      }
    }
  }
`;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
    __typename
    handle
    id
    title
    trackingParameters
  }
`;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
    blog {
      handle
    }
  }
`;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

async function regularSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 8});
  const term = String(url.searchParams.get('q') || '');

  const {errors, ...items} = await storefront.query(SEARCH_QUERY, {
    variables: {...variables, term},
  });

  if (!items) throw new Error('No search data returned from Shopify API');

  const total = Object.values(items).reduce(
    (acc, {nodes}) => acc + nodes.length,
    0,
  );

  const error = errors
    ? errors.map(({message}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog { handle }
    image { url altText width height }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image { url altText width height }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    variants(first: 1) {
      nodes {
        id
        image { url altText width height }
        price { amount currencyCode }
      }
    }
  }
`;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles { ...PredictiveArticle }
      collections { ...PredictiveCollection }
      pages { ...PredictivePage }
      products { ...PredictiveProduct }
      queries { ...PredictiveQuery }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
`;

async function predictiveSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  const {predictiveSearch: items, errors} = await storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {variables: {limit, limitScope: 'EACH', term}},
  );

  if (errors) throw new Error(`Shopify API errors: ${errors.map(({message}) => message).join(', ')}`);
  if (!items) throw new Error('No predictive search data returned from Shopify API');

  const total = Object.values(items).reduce((acc, item) => acc + item.length, 0);

  return {type, term, result: {items, total}};
}

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@netlify/remix-runtime').ActionFunctionArgs} ActionFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */