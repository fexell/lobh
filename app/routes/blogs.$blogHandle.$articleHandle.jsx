import {defer} from '@netlify/remix-runtime';
import {useLoaderData, Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  {title: `${data?.article.title ?? 'Artikel'} | Butiken`},
];

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, params}) {
  const {blogHandle, articleHandle} = params;
  if (!articleHandle || !blogHandle) throw new Response('Not found', {status: 404});
  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
  ]);
  if (!blog?.articleByHandle) throw new Response(null, {status: 404});
  return {article: blog.articleByHandle, blogHandle};
}

function loadDeferredData() {
  return {};
}

export default function Article() {
  const {article, blogHandle} = useLoaderData();
  const {title, image, contentHtml, author, publishedAt} = article;

  const publishedDate = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(publishedAt));

  return (
    <>
      <style>{`
        .art-page {
          background: #111;
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Hero image ── */
        .art-hero {
          position: relative;
          width: 100%;
          height: clamp(300px, 50vh, 560px);
          overflow: hidden;
          background: #141414;
        }

        .art-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.55) saturate(0.7);
          animation: artHeroZoom 10s ease forwards;
        }

        @keyframes artHeroZoom {
          from { transform: scale(1.04); }
          to   { transform: scale(1); }
        }

        .art-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(17,17,17,0) 40%,
            rgba(17,17,17,0.9) 100%
          );
        }

        /* Title floated over hero */
        .art-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0 48px 48px;
          max-width: 1280px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .art-hero-content { padding: 0 24px 36px; }
        }

        /* ── Plain header (no image) ── */
        .art-header {
          background: #141414;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 64px 48px 48px;
        }

        @media (max-width: 768px) {
          .art-header { padding: 48px 24px 36px; }
        }

        .art-header-inner {
          max-width: 800px;
          margin: 0 auto;
        }

        /* ── Shared header elements ── */
        .art-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .art-breadcrumb a {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: color 0.15s;
        }

        .art-breadcrumb a:hover { color: #7AC9EF; }

        .art-breadcrumb-sep {
          font-size: 10px;
          color: rgba(255,255,255,0.12);
        }

        .art-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #7AC9EF;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .art-label::before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background: #7AC9EF;
        }

        .art-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 300;
          color: #fff;
          margin: 0 0 16px;
          letter-spacing: -0.01em;
          line-height: 1.15;
        }

        .art-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .art-meta-date {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        .art-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          flex-shrink: 0;
        }

        .art-meta-author {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7AC9EF;
          opacity: 0.8;
        }

        /* ── Article body ── */
        .art-body {
          flex: 1;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          padding: 64px 48px 96px;
        }

        @media (max-width: 768px) {
          .art-body { padding: 48px 24px 72px; }
        }

        /* Rich text */
        .art-content h1,
        .art-content h2,
        .art-content h3,
        .art-content h4 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: #fff;
          line-height: 1.2;
          margin: 2em 0 0.6em;
        }

        .art-content h1 { font-size: clamp(26px, 3.5vw, 40px); }
        .art-content h2 { font-size: clamp(22px, 2.8vw, 32px); }
        .art-content h3 { font-size: clamp(18px, 2.2vw, 24px); }

        .art-content h1:first-child,
        .art-content h2:first-child { margin-top: 0; }

        .art-content p {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.9;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1.4em;
        }

        .art-content p:last-child { margin-bottom: 0; }

        .art-content a {
          color: #7AC9EF;
          text-decoration: none;
          border-bottom: 1px solid rgba(122,201,239,0.3);
          transition: border-color 0.15s;
        }

        .art-content a:hover { border-color: #7AC9EF; }

        .art-content strong, .art-content b {
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }

        .art-content em, .art-content i {
          font-style: italic;
          color: rgba(255,255,255,0.45);
        }

        .art-content hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin: 3em 0;
          position: relative;
        }

        .art-content hr::after {
          content: '';
          position: absolute;
          left: 0; top: -1px;
          width: 32px; height: 1px;
          background: #7AC9EF;
          opacity: 0.5;
        }

        .art-content ul, .art-content ol {
          padding-left: 20px;
          margin-bottom: 1.4em;
        }

        .art-content li {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.4em;
        }

        .art-content ul li::marker { color: #7AC9EF; }
        .art-content ol li::marker { color: rgba(255,255,255,0.2); }

        .art-content blockquote {
          border-left: 2px solid #7AC9EF;
          margin: 2em 0;
          padding: 8px 0 8px 24px;
        }

        .art-content blockquote p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          font-style: italic;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
        }

        .art-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 2em 0;
          display: block;
          border: 1px solid rgba(255,255,255,0.06);
        }

        /* ── Back link ── */
        .art-back {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          margin-top: 56px;
          transition: color 0.2s;
        }

        .art-back::before {
          content: '←';
          font-size: 12px;
          color: #7AC9EF;
          transition: transform 0.2s;
        }

        .art-back:hover {
          color: rgba(255,255,255,0.6);
        }

        .art-back:hover::before {
          transform: translateX(-4px);
        }
      `}</style>

      <div className="art-page">

        {/* Hero image or plain header */}
        {image ? (
          <div className="art-hero">
            <Image
              data={image}
              sizes="100vw"
              loading="eager"
            />
            <div className="art-hero-overlay" />
            <div className="art-hero-content" style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 48px 48px'}}>
              <div style={{maxWidth:'800px',margin:'0 auto'}}>
                <div className="art-label">Artikel</div>
                <h1 className="art-title">{title}</h1>
                <div className="art-meta">
                  <span className="art-meta-date">{publishedDate}</span>
                  {author?.name && (
                    <>
                      <span className="art-meta-dot" />
                      <span className="art-meta-author">{author.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="art-header">
            <div className="art-header-inner">
              <nav className="art-breadcrumb">
                <Link to="/blogs">Blogg</Link>
                <span className="art-breadcrumb-sep">›</span>
                <Link to={`/blogs/${blogHandle}`} style={{color:'rgba(255,255,255,0.25)',textDecoration:'none',fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase'}}>
                  {blogHandle}
                </Link>
              </nav>
              <div className="art-label">Artikel</div>
              <h1 className="art-title">{title}</h1>
              <div className="art-meta">
                <span className="art-meta-date">{publishedDate}</span>
                {author?.name && (
                  <>
                    <span className="art-meta-dot" />
                    <span className="art-meta-author">{author.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Article content */}
        <div className="art-body">
          <div
            className="art-content"
            dangerouslySetInnerHTML={{__html: contentHtml}}
          />
          <Link to={`/blogs/${blogHandle}`} className="art-back">
            Tillbaka till bloggen
          </Link>
        </div>

      </div>
    </>
  );
}

const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        title
        contentHtml
        publishedAt
        author: authorV2 { name }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
`;

/** @typedef {import('@netlify/remix-runtime').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */