export function validateUrl(url: string): { isValid: boolean; sanitizedUrl: string } {
  try {
    // Handle search queries
    if (!url.includes('.') && !url.startsWith('http')) {
      // Generate comprehensive Google search URL with all parameters
      const params = new URLSearchParams();
      params.append('q', url);
      params.append('source', 'hp');
      params.append('sclient', 'gws-wiz');
      params.append('uact', '5');
      params.append('sca_esv', Math.random().toString(36).substring(2, 18));
      params.append('ei', Math.random().toString(36).substring(2, 18));
      params.append('iflsig', 'AOw8s4IAAAAAaEd8EwCpc6JljWV3fai-Gxi76OQQrTWV');
      params.append('ved', '0ahUKEwj327jzvuWNAxXciO4BHcPlAYcQ4dUDCA8');
      params.append('oq', url);
      params.append('gs_lp', 'Egdnd3Mtd2l6');
      
      return {
        isValid: true,
        sanitizedUrl: `https://www.google.com/search?${params.toString()}`
      };
    }

    // Add protocol if missing
    let sanitizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      sanitizedUrl = `https://${url}`;
    }

    // Validate URL format
    new URL(sanitizedUrl);
    
    return { isValid: true, sanitizedUrl };
  } catch {
    return { isValid: false, sanitizedUrl: url };
  }
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

export function isSecureUrl(url: string): boolean {
  return url.startsWith('https://');
}

export function shouldShowSecurityWarning(url: string): boolean {
  const suspiciousPatterns = [
    'malicious',
    'phishing',
    'scam',
    'hack',
    'virus',
    'malware',
    'suspicious'
  ];

  return suspiciousPatterns.some(pattern => 
    url.toLowerCase().includes(pattern)
  );
}

export function generateFavicon(url: string): string {
  try {
    const domain = extractDomain(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    return '';
  }
}

export function getUserAgents(): Record<string, string> {
  return {
    'Chrome (Windows)': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Firefox (Windows)': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Safari (macOS)': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Chrome (Android)': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    'Safari (iOS)': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  };
}

export function sanitizeHtml(html: string, options: {
  removeAds?: boolean;
  removeTrackers?: boolean;
  removeMalware?: boolean;
} = {}): string {
  let sanitized = html;

  if (options.removeAds) {
    // Remove common ad-related elements
    sanitized = sanitized.replace(/<!-- Google.*?-->/g, '');
    sanitized = sanitized.replace(/<script[^>]*googletag[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<div[^>]*ad[^>]*>.*?<\/div>/gi, '');
  }

  if (options.removeTrackers) {
    // Remove tracking scripts
    sanitized = sanitized.replace(/<script[^>]*analytics[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<script[^>]*facebook[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<script[^>]*twitter[^>]*>.*?<\/script>/gi, '');
  }

  if (options.removeMalware) {
    // Remove potentially malicious scripts
    sanitized = sanitized.replace(/<script[^>]*eval[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
  }

  return sanitized;
}
