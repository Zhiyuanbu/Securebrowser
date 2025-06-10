import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTabSchema, insertBookmarkSchema, insertHistorySchema, insertSecuritySettingsSchema } from "@shared/schema";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo purposes
  const DEFAULT_USER_ID = 1;

  // Initialize a default user
  storage.createUser({ username: "demo", password: "demo" });

  // Tab management routes
  app.get("/api/tabs", async (req, res) => {
    try {
      const tabs = await storage.getTabs(DEFAULT_USER_ID);
      res.json(tabs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tabs" });
    }
  });

  app.post("/api/tabs", async (req, res) => {
    try {
      const tabData = insertTabSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const tab = await storage.createTab(tabData);
      res.json(tab);
    } catch (error) {
      res.status(400).json({ error: "Invalid tab data" });
    }
  });

  app.put("/api/tabs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const tab = await storage.updateTab(id, updates);
      if (!tab) {
        return res.status(404).json({ error: "Tab not found" });
      }
      res.json(tab);
    } catch (error) {
      res.status(400).json({ error: "Failed to update tab" });
    }
  });

  app.delete("/api/tabs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTab(id);
      if (!success) {
        return res.status(404).json({ error: "Tab not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete tab" });
    }
  });

  // Bookmark routes
  app.get("/api/bookmarks", async (req, res) => {
    try {
      const bookmarks = await storage.getBookmarks(DEFAULT_USER_ID);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const bookmark = await storage.createBookmark(bookmarkData);
      res.json(bookmark);
    } catch (error) {
      res.status(400).json({ error: "Invalid bookmark data" });
    }
  });

  app.delete("/api/bookmarks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBookmark(id);
      if (!success) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete bookmark" });
    }
  });

  // History routes
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getHistory(DEFAULT_USER_ID);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const historyData = insertHistorySchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const historyEntry = await storage.addToHistory(historyData);
      res.json(historyEntry);
    } catch (error) {
      res.status(400).json({ error: "Invalid history data" });
    }
  });

  app.delete("/api/history", async (req, res) => {
    try {
      const success = await storage.clearHistory(DEFAULT_USER_ID);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear history" });
    }
  });

  // Security settings routes
  app.get("/api/security-settings", async (req, res) => {
    try {
      const settings = await storage.getSecuritySettings(DEFAULT_USER_ID);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch security settings" });
    }
  });

  app.put("/api/security-settings", async (req, res) => {
    try {
      const settingsData = insertSecuritySettingsSchema.parse(req.body);
      const settings = await storage.updateSecuritySettings(DEFAULT_USER_ID, settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid security settings data" });
    }
  });

  // Proxy route for bypassing iframe restrictions
  app.get("/api/proxy", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
      }

      // Validate URL
      let targetUrl: URL;
      try {
        targetUrl = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL" });
      }

      // Handle special cases for common redirects
      let finalUrl = url;
      
      // Handle Google search redirects
      if (targetUrl.hostname.includes('google.com') && targetUrl.pathname.includes('/url')) {
        const actualUrl = targetUrl.searchParams.get('url') || targetUrl.searchParams.get('q');
        if (actualUrl) {
          finalUrl = actualUrl;
          targetUrl = new URL(finalUrl);
        }
      }

      // Get security settings
      const securitySettings = await storage.getSecuritySettings(DEFAULT_USER_ID);
      
      // Determine content type from URL
      const isCSS = url.includes('.css') || url.includes('stylesheet');
      const isJS = url.includes('.js') || url.includes('javascript');
      const isImage = url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
      const isFont = url.match(/\.(woff|woff2|ttf|eot)$/i);
      
      // Set up headers to bypass restrictions with desktop user agent for better compatibility
      const headers: Record<string, string> = {
        'User-Agent': securitySettings?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Site': 'cross-site',
        'Referer': targetUrl.origin,
        'DNT': '1',
        'Cache-Control': 'no-cache',
      };

      // Set appropriate Accept header based on content type
      if (isCSS) {
        headers['Accept'] = 'text/css,*/*;q=0.1';
        headers['Sec-Fetch-Dest'] = 'style';
        headers['Sec-Fetch-Mode'] = 'no-cors';
      } else if (isJS) {
        headers['Accept'] = '*/*';
        headers['Sec-Fetch-Dest'] = 'script';
        headers['Sec-Fetch-Mode'] = 'no-cors';
      } else if (isImage) {
        headers['Accept'] = 'image/webp,image/apng,image/*,*/*;q=0.8';
        headers['Sec-Fetch-Dest'] = 'image';
        headers['Sec-Fetch-Mode'] = 'no-cors';
      } else if (isFont) {
        headers['Accept'] = '*/*';
        headers['Sec-Fetch-Dest'] = 'font';
        headers['Sec-Fetch-Mode'] = 'cors';
      } else {
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8';
        headers['Sec-Fetch-Dest'] = 'document';
        headers['Sec-Fetch-Mode'] = 'navigate';
        headers['Upgrade-Insecure-Requests'] = '1';
      }

      // Handle redirects manually with proper following
      let response = await fetch(finalUrl, { 
        headers,
        redirect: 'follow',
        follow: 10
      });

      // Get final URL after redirects
      const responseUrl = response.url;
      const responseUrlObj = new URL(responseUrl);

      if (!response.ok) {
        // For 404s, try to redirect to main domain
        // Handle redirects and mobile-specific pages
        if (response.status === 404 && responseUrlObj.pathname !== '/') {
          const baseUrl = `${responseUrlObj.protocol}//${responseUrlObj.host}`;
          try {
            const baseResponse = await fetch(baseUrl, { headers, redirect: 'follow' });
            if (baseResponse.ok) {
              response = baseResponse;
            }
          } catch {
            // Continue with original error
          }
        }
        
        // Handle mobile redirects and app prompts
        if (response.status >= 400) {
          // Try to access the main site instead of mobile redirects
          if (responseUrlObj.hostname.includes('m.') || responseUrlObj.pathname.includes('/mobile')) {
            const mainSiteUrl = responseUrlObj.toString().replace('m.', 'www.').replace('/mobile', '');
            try {
              const mainResponse = await fetch(mainSiteUrl, { headers, redirect: 'follow' });
              if (mainResponse.ok) {
                response = mainResponse;
              }
            } catch {
              // Continue with error handling
            }
          }
          
          if (response.status >= 400) {
            return res.status(200).send(`
              <html>
                <head>
                  <title>Oops! Something went wrong</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                      margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      min-height: 100vh; display: flex; align-items: center; justify-content: center;
                    }
                    .container { 
                      background: white; padding: 40px; border-radius: 12px; 
                      box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; max-width: 500px; width: 100%;
                    }
                    .emoji { font-size: 48px; margin-bottom: 20px; }
                    h1 { color: #333; margin-bottom: 15px; font-size: 24px; }
                    p { color: #666; margin-bottom: 20px; line-height: 1.5; }
                    .buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
                    .btn { 
                      padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                      font-weight: 500; transition: all 0.2s; display: inline-block;
                    }
                    .btn-primary { background: #667eea; color: white; }
                    .btn-primary:hover { background: #5a6fd8; transform: translateY(-1px); }
                    .btn-secondary { background: #f8f9fa; color: #333; border: 1px solid #dee2e6; }
                    .btn-secondary:hover { background: #e9ecef; }
                    .details { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; font-size: 14px; color: #6c757d; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="emoji">🌐</div>
                    <h1>We couldn't load that page</h1>
                    <p>The website might be temporarily unavailable, or it may have moved to a new location.</p>
                    <div class="buttons">
                      <a href="/api/proxy?url=${encodeURIComponent(`${responseUrlObj.protocol}//${responseUrlObj.host}`)}" class="btn btn-primary">
                        Try Homepage
                      </a>
                      <a href="javascript:history.back()" class="btn btn-secondary">
                        Go Back
                      </a>
                    </div>
                    <div class="details">
                      <strong>Website:</strong> ${responseUrlObj.hostname}<br>
                      <strong>Status:</strong> ${response.status} ${response.statusText}
                    </div>
                  </div>
                </body>
              </html>
            `);
          }
        }
      }

      const contentType = response.headers.get('content-type') || '';

      // Handle non-HTML content (CSS, JS, images, fonts)
      if (!contentType.includes('text/html')) {
        const buffer = await response.arrayBuffer();
        
        // Set appropriate headers for static assets
        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        });
        
        return res.send(Buffer.from(buffer));
      }

      // Process HTML content
      let content = await response.text();

      // Fix all relative URLs to work through proxy
      const finalBaseUrl = `${responseUrlObj.protocol}//${responseUrlObj.host}`;
      
      content = content.replace(/href="\/([^"]*)/g, `href="/api/proxy?url=${encodeURIComponent(finalBaseUrl)}/$1"`);
      content = content.replace(/src="\/([^"]*)/g, `src="/api/proxy?url=${encodeURIComponent(finalBaseUrl)}/$1"`);
      content = content.replace(/action="\/([^"]*)/g, `action="/api/proxy?url=${encodeURIComponent(finalBaseUrl)}/$1"`);
      
      // Fix CSS url() references
      content = content.replace(/url\(["']?\/([^"')]*)/g, `url("/api/proxy?url=${encodeURIComponent(finalBaseUrl)}/$1"`);
      
      // Fix relative paths without leading slash
      content = content.replace(/href="([^"]*)" /g, (match, p1) => {
        if (!p1.startsWith('http') && !p1.startsWith('/') && !p1.startsWith('#') && !p1.startsWith('mailto:') && !p1.startsWith('javascript:')) {
          return `href="/api/proxy?url=${encodeURIComponent(new URL(p1, responseUrl).toString())}" `;
        }
        return match;
      });
      
      content = content.replace(/src="([^"]*)" /g, (match, p1) => {
        if (!p1.startsWith('http') && !p1.startsWith('/') && !p1.startsWith('data:') && !p1.startsWith('javascript:')) {
          return `src="/api/proxy?url=${encodeURIComponent(new URL(p1, responseUrl).toString())}" `;
        }
        return match;
      });

      // Fix form submissions to handle search properly
      content = content.replace(/<form([^>]*)>/g, (match, attrs) => {
        // Extract action URL if present
        const actionMatch = attrs.match(/action=["']([^"']+)["']/);
        if (actionMatch) {
          const actionUrl = actionMatch[1];
          let fullActionUrl = actionUrl;
          
          // Convert relative URLs to absolute
          if (actionUrl.startsWith('/')) {
            fullActionUrl = `${finalBaseUrl}${actionUrl}`;
          } else if (!actionUrl.startsWith('http')) {
            fullActionUrl = new URL(actionUrl, responseUrl).toString();
          }
          
          // Replace action with proxy URL and add onsubmit handler for GET forms
          const newAttrs = attrs.replace(/action=["'][^"']+["']/, `action="/api/proxy"`);
          const isGetForm = attrs.includes('method="get"') || attrs.includes("method='get'") || !attrs.includes('method=');
          
          if (isGetForm) {
            // Special handling for Google search forms
            const isGoogleSearch = fullActionUrl.includes('google.com') && fullActionUrl.includes('/search');
            if (isGoogleSearch) {
              return `<form${newAttrs} target="_self" onsubmit="
                const formData = new FormData(this);
                const params = new URLSearchParams();
                
                // Add form data
                for (const [key, value] of formData.entries()) {
                  params.append(key, value);
                }
                
                // Add comprehensive Google-specific parameters for better search results
                if (!params.has('source')) params.append('source', 'hp');
                if (!params.has('sclient')) params.append('sclient', 'gws-wiz');
                if (!params.has('uact')) params.append('uact', '5');
                if (!params.has('sca_esv')) params.append('sca_esv', Math.random().toString(36).substring(2, 18));
                if (!params.has('ei')) params.append('ei', Math.random().toString(36).substring(2, 18));
                if (!params.has('iflsig')) params.append('iflsig', 'AOw8s4IAAAAAaEd8EwCpc6JljWV3fai-Gxi76OQQrTWV');
                if (!params.has('ved')) params.append('ved', '0ahUKEwj327jzvuWNAxXciO4BHcPlAYcQ4dUDCA8');
                if (!params.has('oq')) {
                  const queryValue = params.get('q') || '';
                  if (queryValue) params.append('oq', queryValue);
                }
                if (!params.has('gs_lp')) params.append('gs_lp', 'Egdnd3Mtd2l6');
                
                const baseUrl = '${fullActionUrl}';
                const separator = baseUrl.includes('?') ? '&' : '?';
                const searchUrl = baseUrl + separator + params.toString();
                window.location.href = '/api/proxy?url=' + encodeURIComponent(searchUrl);
                return false;
              ">`;
            } else {
              return `<form${newAttrs} target="_self" onsubmit="
                const formData = new FormData(this);
                const params = new URLSearchParams();
                for (const [key, value] of formData.entries()) {
                  params.append(key, value);
                }
                const baseUrl = '${fullActionUrl}';
                const separator = baseUrl.includes('?') ? '&' : '?';
                const searchUrl = baseUrl + separator + params.toString();
                window.location.href = '/api/proxy?url=' + encodeURIComponent(searchUrl);
                return false;
              ">`;
            }
          } else {
            return `<form${newAttrs} target="_self" onsubmit="
              this.action = '/api/proxy?url=' + encodeURIComponent('${fullActionUrl}');
              return true;
            ">`;
          }
        }
        
        // Handle forms without explicit action (submit to current page)
        const isGetForm = attrs.includes('method="get"') || attrs.includes("method='get'") || !attrs.includes('method=');
        if (isGetForm) {
          const isGoogleSearch = responseUrl.includes('google.com');
          if (isGoogleSearch) {
            return `<form${attrs} target="_self" onsubmit="
              const formData = new FormData(this);
              const params = new URLSearchParams();
              
              // Add form data
              for (const [key, value] of formData.entries()) {
                params.append(key, value);
              }
              
              // Add comprehensive Google-specific parameters for better search results
              if (!params.has('source')) params.append('source', 'hp');
              if (!params.has('sclient')) params.append('sclient', 'gws-wiz');
              if (!params.has('uact')) params.append('uact', '5');
              if (!params.has('sca_esv')) params.append('sca_esv', Math.random().toString(36).substring(2, 18));
              if (!params.has('ei')) params.append('ei', Math.random().toString(36).substring(2, 18));
              if (!params.has('iflsig')) params.append('iflsig', 'AOw8s4IAAAAAaEd8EwCpc6JljWV3fai-Gxi76OQQrTWV');
              if (!params.has('ved')) params.append('ved', '0ahUKEwj327jzvuWNAxXciO4BHcPlAYcQ4dUDCA8');
              if (!params.has('oq')) {
                const queryValue = params.get('q') || '';
                if (queryValue) params.append('oq', queryValue);
              }
              if (!params.has('gs_lp')) params.append('gs_lp', 'Egdnd3Mtd2l6');
              
              // Use Google search endpoint for homepage searches
              const currentUrl = '${responseUrl}';
              const urlParts = currentUrl.split('/');
              const searchBaseUrl = urlParts[0] + '//' + urlParts[2] + '/search';
              const searchUrl = searchBaseUrl + '?' + params.toString();
              window.location.href = '/api/proxy?url=' + encodeURIComponent(searchUrl);
              return false;
            ">`;
          } else {
            return `<form${attrs} target="_self" onsubmit="
              const formData = new FormData(this);
              const params = new URLSearchParams();
              for (const [key, value] of formData.entries()) {
                params.append(key, value);
              }
              const baseUrl = '${responseUrl}';
              const separator = baseUrl.includes('?') ? '&' : '?';
              const searchUrl = baseUrl + separator + params.toString();
              window.location.href = '/api/proxy?url=' + encodeURIComponent(searchUrl);
              return false;
            ">`;
          }
        }
        
        return `<form${attrs} target="_self">`;
      });

      // Remove mobile app promotion overlays and redirects
      content = content.replace(/<div[^>]*class="[^"]*app-banner[^"]*"[^>]*>.*?<\/div>/gi, '');
      content = content.replace(/<div[^>]*class="[^"]*mobile-app[^"]*"[^>]*>.*?<\/div>/gi, '');
      content = content.replace(/window\.location\.href\s*=\s*["'][^"']*app[^"']*["']/gi, '');
      content = content.replace(/location\.replace\s*\(\s*["'][^"']*app[^"']*["']\s*\)/gi, '');
      
      // Handle "Continue in App" buttons - replace with "Stay in Browser"
      content = content.replace(/Continue in App/gi, 'Stay in Browser');
      content = content.replace(/Open in App/gi, 'Continue in Browser');
      content = content.replace(/Download App/gi, 'Continue Browsing');

      // Fix @import statements in CSS within HTML
      content = content.replace(/@import\s+["']\/([^"']*)/g, `@import "/api/proxy?url=${encodeURIComponent(finalBaseUrl)}/$1"`);

      // Add mobile viewport if missing
      if (!content.includes('viewport') && content.includes('<head>')) {
        content = content.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">');
      }

      // Special handling for Google.com homepage
      const isGoogleHomepage = responseUrl.includes('google.com') && (
        responseUrl === 'https://www.google.com/' || 
        responseUrl === 'https://google.com/' ||
        responseUrl.match(/^https:\/\/(www\.)?google\.com\/?(\?.*)?$/)
      );
      
      if (isGoogleHomepage) {
        // Add popup and disable search functionality
        content = content.replace('</head>', `
          <style>
            .browser-popup-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.5);
              z-index: 10000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .browser-popup {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              max-width: 400px;
              text-align: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .browser-popup h3 {
              margin: 0 0 15px 0;
              color: #333;
              font-size: 18px;
            }
            .browser-popup p {
              margin: 0 0 20px 0;
              color: #666;
              line-height: 1.5;
            }
            .browser-popup button {
              background: #4285f4;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            }
            .browser-popup button:hover {
              background: #3367d6;
            }
            .browser-search-disabled {
              position: relative;
            }
            .browser-search-disabled::after {
              content: "Use the URL bar above to search";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(66, 133, 244, 0.9);
              color: white;
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 12px;
              pointer-events: none;
              white-space: nowrap;
            }
          </style>
          </head>`);
        
        // Add popup HTML
        content = content.replace('<body', `<body`);
        content = content.replace(/<body[^>]*>/, '$&<div class="browser-popup-overlay" id="browserPopup"><div class="browser-popup"><h3>Search Notice</h3><p>To search, please use the URL bar at the top of the browser.</p><button onclick="document.getElementById(\'browserPopup\').style.display=\'none\'">Got it</button></div></div>');
        
        // Disable Google search inputs
        content = content.replace(/<input([^>]*name=["\']q["\'][^>]*)>/g, '<input$1 disabled class="browser-search-disabled">');
        content = content.replace(/<textarea([^>]*name=["\']q["\'][^>]*)>/g, '<textarea$1 disabled class="browser-search-disabled">');
      }

      // Basic content filtering if enabled
      if (securitySettings?.adBlocker) {
        content = content.replace(/<!-- Google.*?-->/g, '');
        content = content.replace(/<script[^>]*googletag[^>]*>.*?<\/script>/gi, '');
        content = content.replace(/<script[^>]*doubleclick[^>]*>.*?<\/script>/gi, '');
      }

      if (securitySettings?.trackerProtection) {
        content = content.replace(/<script[^>]*analytics[^>]*>.*?<\/script>/gi, '');
        content = content.replace(/<script[^>]*facebook[^>]*>.*?<\/script>/gi, '');
        content = content.replace(/<script[^>]*twitter[^>]*>.*?<\/script>/gi, '');
      }

      // Add security headers
      res.set({
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      });

      res.send(content);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send(`
        <html>
          <head><title>Proxy Error</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h1>Failed to Load Page</h1>
            <p>Unable to fetch content from the requested URL.</p>
            <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p>Try visiting the website directly or check if the URL is correct.</p>
          </body>
        </html>
      `);
    }
  });

  // Handle POST requests for form submissions
  app.post("/api/proxy", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        body: new URLSearchParams(req.body).toString(),
        redirect: 'follow'
      });

      if (response.ok) {
        const content = await response.text();
        const responseUrl = response.url;
        const responseUrlObj = new URL(responseUrl);
        const baseUrl = `${responseUrlObj.protocol}//${responseUrlObj.host}`;

        // Process the content similar to GET requests
        const postBaseUrl = `${responseUrlObj.protocol}//${responseUrlObj.host}`;
        let processedContent = content.replace(/href="\/([^"]*)/g, `href="/api/proxy?url=${encodeURIComponent(postBaseUrl)}/$1"`);
        processedContent = processedContent.replace(/src="\/([^"]*)/g, `src="/api/proxy?url=${encodeURIComponent(postBaseUrl)}/$1"`);

        res.set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });

        res.send(processedContent);
      } else {
        res.status(response.status).send(`
          <html>
            <head><title>Form Submission Error</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
              <h1>Form Submission Error</h1>
              <p>Failed to submit form to the server.</p>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('POST proxy error:', error);
      res.status(500).send(`
        <html>
          <head><title>Submission Error</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h1>Submission Failed</h1>
            <p>Unable to submit form data.</p>
          </body>
        </html>
      `);
    }
  });

  // URL validation route
  app.post("/api/validate-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        return res.json({ 
          isValid: false, 
          isSafe: false, 
          reason: "Invalid URL format" 
        });
      }

      // Simple security checks
      const suspiciousPatterns = [
        'malicious',
        'phishing',
        'scam',
        'hack',
        'virus',
        'malware'
      ];

      const isSafe = !suspiciousPatterns.some(pattern => 
        url.toLowerCase().includes(pattern)
      );

      const isHttps = url.startsWith('https://');

      res.json({
        isValid: true,
        isSafe,
        isHttps,
        reason: !isSafe ? "URL contains suspicious content" : 
                !isHttps ? "URL is not using secure HTTPS protocol" : "URL appears safe"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate URL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
