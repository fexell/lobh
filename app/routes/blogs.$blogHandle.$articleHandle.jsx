import {defer} from '@netlify/remix-runtime';
import {useLoaderData, Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {useTheme} from '~/components/PageLayout';

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
  const {theme} = useTheme();

  const publishedDate = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(publishedAt));

  return (
    <>
      <style>{`
        /* ── Theme variables ── */
        .art-page[data-theme="dark"] {
          --art-bg:               #111;
          --art-bg-header:        #141414;
          --art-bg-hero:          #141414;
          --art-heading:          #fff;
          --art-text:             rgba(255,255,255,0.5);
          --art-strong:           rgba(255,255,255,0.7);
          --art-em:               rgba(255,255,255,0.45);
          --art-border:           rgba(255,255,255,0.06);
          --art-hr:               rgba(255,255,255,0.07);
          --art-accent:           #7AC9EF;
          --art-accent-border:    rgba(122,201,239,0.3);
          --art-breadcrumb:       rgba(255,255,255,0.25);
          --art-breadcrumb-sep:   rgba(255,255,255,0.12);
          --art-meta-date:        rgba(255,255,255,0.25);
          --art-meta-dot:         rgba(255,255,255,0.15);
          --art-meta-author:      #7AC9EF;
          --art-back-color:       rgba(255,255,255,0.25);
          --art-back-hover:       rgba(255,255,255,0.6);
          --art-ol-marker:        rgba(255,255,255,0.2);
          --art-blockquote-text:  rgba(255,255,255,0.5);
        }

        .art-page[data-theme="light"] {
          --art-bg:               #f5f5f3;
          --art-bg-header:        #ebebea;
          --art-bg-hero:          #e8e8e6;
          --art-heading:          #111;
          --art-text:             rgba(30,30,30,0.6);
          --art-strong:           rgba(30,30,30,0.8);
          --art-em:               rgba(30,30,30,0.5);
          --art-border:           rgba(0,0,0,0.07);
          --art-hr:               rgba(0,0,0,0.08);
          --art-accent:           #2a8ab5;
          --art-accent-border:    rgba(42,138,181,0.3);
          --art-breadcrumb:       rgba(30,30,30,0.3);
          --art-breadcrumb-sep:   rgba(30,30,30,0.15);
          --art-meta-date:        rgba(30,30,30,0.3);
          --art-meta-dot:         rgba(30,30,30,0.2);
          --art-meta-author:      #2a8ab5;
          --art-back-color:       rgba(30,30,30,0.3);
          --art-back-hover:       rgba(30,30,30,0.65);
          --art-ol-marker:        rgba(30,30,30,0.25);
          --art-blockquote-text:  rgba(30,30,30,0.5);
        }

        /* ── Base ── */
        .art-page {
          background: var(--art-bg);
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* ── Hero image — always dark (photo background) ── */
        .art-hero {
          position: relative;
          width: 100%;
          height: clamp(300px, 50vh, 560px);
          overflow: hidden;
          background: var(--art-bg-hero);
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

        /* Hero text always white — dark photo underneath */
        .art-hero-content {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 48px 48px;
        }

        .art-hero-content-inner {
          max-width: 800px;
          margin: 0 auto;
        }

        .art-hero .art-label         { color: #7AC9EF; }
        .art-hero .art-label::before { background: #7AC9EF; }
        .art-hero .art-title         { color: #fff; }
        .art-hero .art-meta-date     { color: rgba(255,255,255,0.25); }
        .art-hero .art-meta-dot      { background: rgba(255,255,255,0.15); }
        .art-hero .art-meta-author   { color: #7AC9EF; }

        @media (max-width: 768px) {
          .art-hero-content { padding: 0 24px 36px; }
        }

        /* ── Plain header (no image) — theme-aware ── */
        .art-header {
          background: var(--art-bg-header);
          border-bottom: 1px solid var(--art-border);
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
          color: var(--art-breadcrumb);
          text-decoration: none;
          transition: color 0.15s;
        }

        .art-breadcrumb a:hover { color: var(--art-accent); }

        .art-breadcrumb-sep {
          font-size: 10px;
          color: var(--art-breadcrumb-sep);
        }

        .art-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--art-accent);
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
          background: var(--art-accent);
        }

        .art-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 300;
          color: var(--art-heading);
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
          color: var(--art-meta-date);
        }

        .art-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--art-meta-dot);
          flex-shrink: 0;
        }

        .art-meta-author {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--art-meta-author);
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

        /* ── Rich text ── */
        .art-content h1,
        .art-content h2,
        .art-content h3,
        .art-content h4 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: var(--art-heading);
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
          color: var(--art-text);
          margin-bottom: 1.4em;
        }

        .art-content p:last-child { margin-bottom: 0; }

        .art-content a {
          color: var(--art-accent);
          text-decoration: none;
          border-bottom: 1px solid var(--art-accent-border);
          transition: border-color 0.15s;
        }

        .art-content a:hover { border-color: var(--art-accent); }

        .art-content strong,
        .art-content b {
          font-weight: 500;
          color: var(--art-strong);
        }

        .art-content em,
        .art-content i {
          font-style: italic;
          color: var(--art-em);
        }

        .art-content hr {
          border: none;
          border-top: 1px solid var(--art-hr);
          margin: 3em 0;
          position: relative;
        }

        .art-content hr::after {
          content: '';
          position: absolute;
          left: 0; top: -1px;
          width: 32px; height: 1px;
          background: var(--art-accent);
          opacity: 0.5;
        }

        .art-content ul,
        .art-content ol {
          padding-left: 20px;
          margin-bottom: 1.4em;
        }

        .art-content li {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--art-text);
          margin-bottom: 0.4em;
        }

        .art-content ul li::marker { color: var(--art-accent); }
        .art-content ol li::marker { color: var(--art-ol-marker); }

        .art-content blockquote {
          border-left: 2px solid var(--art-accent);
          margin: 2em 0;
          padding: 8px 0 8px 24px;
        }

        .art-content blockquote p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          font-style: italic;
          color: var(--art-blockquote-text);
          line-height: 1.6;
        }

        .art-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 2em 0;
          display: block;
          border: 1px solid var(--art-border);
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
          color: var(--art-back-color);
          text-decoration: none;
          margin-top: 56px;
          transition: color 0.2s;
        }

        .art-back::before {
          content: '←';
          font-size: 12px;
          color: var(--art-accent);
          transition: transform 0.2s;
        }

        .art-back:hover {
          color: var(--art-back-hover);
        }

        .art-back:hover::before {
          transform: translateX(-4px);
        }
      `}</style>

      <div className="art-page" data-theme={theme}>

        {/* Hero image or plain header */}
        {image ? (
          <div className="art-hero">
            <Image data={image} sizes="100vw" loading="eager" />
            <div className="art-hero-overlay" />
            <div className="art-hero-content">
              <div className="art-hero-content-inner">
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
                <Link to={`/blogs/${blogHandle}`}>{blogHandle}</Link>
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