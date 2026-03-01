import {json} from '@netlify/remix-runtime';
import {useLoaderData, Link} from '@remix-run/react';
import {getPaginationVariables, Analytics, Image, Money} from '@shopify/hydrogen';
import {SearchForm} from '~/components/SearchForm';
import {SearchResults} from '~/components/SearchResults';
import {getEmptyPredictiveSearchResult} from '~/lib/search';

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
  if (type === 'predictive') return null;

  const hasResults = term && result?.total > 0;

  return (
    <>
      <style>{`
        .srch-page {
          background: #111;
          min-height: calc(100vh - 110px);
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .srch-header {
          background: #141414;
          border-bottom: 1px solid rgba(255,255,255,0.06);
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
          color: #7AC9EF;
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
          background: #7AC9EF;
        }

        .srch-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 300;
          color: #fff;
          margin: 0 0 32px;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        /* ── Search input ── */
        .srch-form-wrap {
          display: flex;
          gap: 0;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .srch-form-wrap:focus-within {
          border-color: rgba(122,201,239,0.5);
        }

        .srch-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: none;
          outline: none;
          padding: 16px 20px;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #fff;
          letter-spacing: 0.04em;
        }

        .srch-input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .srch-submit {
          background: #7AC9EF;
          border: none;
          padding: 0 28px;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0d1a22;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .srch-submit:hover {
          background: #9dd8f4;
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
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.08em;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .srch-meta strong {
          color: rgba(255,255,255,0.55);
          font-weight: 500;
        }

        /* ── Section heading ── */
        .srch-section-heading {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #7AC9EF;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          margin-top: 48px;
        }

        .srch-section-heading:first-child {
          margin-top: 0;
        }

        .srch-section-heading::before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background: #7AC9EF;
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
          background: #1a1a1a;
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }

        .srch-product-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: #7AC9EF;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          z-index: 1;
        }

        .srch-product-card:hover { background: #1e1e1e; }
        .srch-product-card:hover::before { transform: scaleX(1); }

        .srch-product-img {
          aspect-ratio: 1/1;
          overflow: hidden;
          background: #141414;
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
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .srch-product-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.7);
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }

        .srch-product-card:hover .srch-product-title { color: #fff; }

        .srch-product-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 300;
          color: #7AC9EF;
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
          background: #1a1a1a;
          text-decoration: none;
          transition: background 0.2s;
          gap: 16px;
        }

        .srch-list-item:hover { background: #1e1e1e; }

        .srch-list-title {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }

        .srch-list-item:hover .srch-list-title { color: #fff; }

        .srch-list-type {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
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
          color: rgba(255,255,255,0.05);
          line-height: 1;
          margin-bottom: 24px;
        }

        .srch-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
        }

        .srch-empty-sub {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Error ── */
        .srch-error {
          padding: 20px 24px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 3px;
          font-size: 12px;
          color: rgba(239,68,68,0.8);
          margin-bottom: 32px;
          letter-spacing: 0.03em;
        }
      `}</style>

      <div className="srch-page">

        {/* Header */}
        <div className="srch-header">
          <div className="srch-header-inner">
            <div className="srch-label">Sök</div>
            <h1 className="srch-title">
              {term ? <>Resultat för <em style={{fontStyle:'italic'}}>"{term}"</em></> : 'Sök i butiken'}
            </h1>

            {/* Search form */}
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
                                    <div style={{width:'100%',height:'100%',background:'#181818',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'40px',color:'rgba(122,201,239,0.1)'}}>✦</span>
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