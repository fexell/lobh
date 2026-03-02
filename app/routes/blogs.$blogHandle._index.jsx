import {defer} from '@netlify/remix-runtime';
import {Link, useLoaderData} from '@remix-run/react';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `${data?.blog.title ?? 'Blogg'} | Butiken`},
];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, request, params}) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 9});
  if (!params.blogHandle) throw new Response('blog not found', {status: 404});
  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {blogHandle: params.blogHandle, ...paginationVariables},
    }),
  ]);
  if (!blog?.articles) throw new Response('Not found', {status: 404});
  return {blog};
}

function loadDeferredData() {
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData();
  const {articles} = blog;

  return (
    <>
      <style>{`
        .bh-page {
          background: #111;
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .bh-header {
          background: #141414;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 64px 48px 48px;
        }

        @media (max-width: 768px) {
          .bh-header { padding: 48px 24px 36px; }
        }

        .bh-header-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .bh-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .bh-breadcrumb a {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: color 0.15s;
        }

        .bh-breadcrumb a:hover { color: #7AC9EF; }

        .bh-breadcrumb-sep {
          font-size: 10px;
          color: rgba(255,255,255,0.12);
        }

        .bh-label {
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

        .bh-label::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #7AC9EF;
        }

        .bh-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 300;
          color: #fff;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        /* ── Grid body ── */
        .bh-body {
          flex: 1;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 56px 48px 96px;
        }

        @media (max-width: 768px) {
          .bh-body { padding: 40px 24px 72px; }
        }

        /* Article grid */
        .bh-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }

        @media (max-width: 900px) {
          .bh-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .bh-grid { grid-template-columns: 1fr; }
        }

        /* ── Article card ── */
        .bh-card {
          display: block;
          text-decoration: none;
          background: #1a1a1a;
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }

        .bh-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: #7AC9EF;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .bh-card:hover { background: #1e1e1e; }
        .bh-card:hover::before { transform: scaleX(1); }

        .bh-card-img {
          overflow: hidden;
          aspect-ratio: 3 / 2;
          background: #141414;
        }

        .bh-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.4s ease;
          filter: brightness(0.85) saturate(0.8);
        }

        .bh-card:hover .bh-card-img img {
          transform: scale(1.05);
          filter: brightness(0.95) saturate(1);
        }

        .bh-card-no-img {
          aspect-ratio: 3 / 2;
          background: #181818;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bh-card-no-img-icon {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          color: rgba(122,201,239,0.08);
          font-weight: 300;
        }

        .bh-card-body {
          padding: 22px 24px 26px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .bh-card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .bh-card-date {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        .bh-card-author {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7AC9EF;
          opacity: 0.7;
        }

        .bh-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 2vw, 24px);
          font-weight: 400;
          color: #fff;
          line-height: 1.3;
          letter-spacing: 0;
          margin: 0;
          transition: color 0.2s;
        }

        .bh-card:hover .bh-card-title {
          color: rgba(255,255,255,0.85);
        }
      `}</style>

      <div className="bh-page">

        {/* Header */}
        <div className="bh-header">
          <div className="bh-header-inner">
            <nav className="bh-breadcrumb">
              <Link to="/blogs">Blogg</Link>
              <span className="bh-breadcrumb-sep">›</span>
              <span style={{fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)'}}>
                {blog.title}
              </span>
            </nav>
            <div className="bh-label">Redaktion</div>
            <h1 className="bh-title">{blog.title}</h1>
          </div>
        </div>

        {/* Article grid */}
        <div className="bh-body">
          <div className="bh-grid">
            <PaginatedResourceSection connection={articles}>
              {({node: article, index}) => (
                <ArticleItem
                  article={article}
                  key={article.id}
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              )}
            </PaginatedResourceSection>
          </div>
        </div>

      </div>
    </>
  );
}

/** @param {{ article: ArticleItemFragment; loading?: HTMLImageElement['loading'] }} */
function ArticleItem({article, loading}) {
  const publishedAt = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <Link
      className="bh-card"
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      prefetch="intent"
    >
      {article.image ? (
        <div className="bh-card-img">
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="3/2"
            data={article.image}
            loading={loading}
            sizes="(min-width: 900px) 33vw, (min-width: 480px) 50vw, 100vw"
          />
        </div>
      ) : (
        <div className="bh-card-no-img">
          <span className="bh-card-no-img-icon">✦</span>
        </div>
      )}
      <div className="bh-card-body">
        <div className="bh-card-meta">
          <span className="bh-card-date">{publishedAt}</span>
          {article.author?.name && (
            <span className="bh-card-author">{article.author.name}</span>
          )}
        </div>
        <h2 className="bh-card-title">{article.title}</h2>
      </div>
    </Link>
  );
}

const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 { name }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog { handle }
  }
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ArticleItemFragment} ArticleItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */