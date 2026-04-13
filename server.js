// @ts-ignore -- virtual entry point for the app, resolved by Vite at build time
import * as remixBuild from 'virtual:remix/server-build';
import {
  createHydrogenAppLoadContext,
  createRequestHandler,
} from '@netlify/remix-edge-adapter';
import {storefrontRedirect} from '@shopify/hydrogen';
import {createAppLoadContext} from './app/lib/context';

/**
 * @param {Request} request
 * @param {Context} netlifyContext
 * @return {Promise<any>}
 */
export default async function (request, netlifyContext) {
  try {
    const isDev = process.env.NODE_ENV === 'development';

    const appLoadContext = isDev
      ? await createAppLoadContext(request, process.env, netlifyContext)  // skicka process.env som env
      : await createHydrogenAppLoadContext(
          request,
          netlifyContext,
          createAppLoadContext,
        );

    const handleRequest = createRequestHandler({
      build: remixBuild,
      mode: process.env.NODE_ENV,
    });

    const response = await handleRequest(request, appLoadContext);

    if (!response) {
      return;
    }

    if (appLoadContext.session.isPending) {
      response.headers.set('Set-Cookie', await appLoadContext.session.commit());
    }

    if (response.status === 404) {
      return storefrontRedirect({
        request,
        response,
        storefront: appLoadContext.storefront,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return new Response('An unexpected error occurred', {status: 500});
  }
}

/** @typedef {import('@netlify/edge-functions').Context} Context */