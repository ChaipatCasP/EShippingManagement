import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // Serve static assets from the dist directory
    const response = await getAssetFromKV(event, {
      mapRequestToAsset: req => {
        const url = new URL(req.url);
        
        // For SPA routing - if the request is for a path that doesn't exist,
        // serve index.html instead
        if (!url.pathname.includes('.') && url.pathname !== '/') {
          return new Request(url.origin + '/index.html', req);
        }
        
        return req;
      },
    });

    // Add CORS headers for API requests
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return newResponse;
  } catch (e) {
    // If asset not found, serve index.html for SPA routing
    try {
      const response = await getAssetFromKV(event, {
        mapRequestToAsset: () => new Request(new URL('/index.html', request.url), request),
      });
      return response;
    } catch (e) {
      return new Response('Not found', { status: 404 });
    }
  }
}
