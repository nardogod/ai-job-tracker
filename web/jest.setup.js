import '@testing-library/jest-dom'

// Minimal polyfills for Next.js API routes in Jest
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

if (typeof global.ReadableStream === 'undefined') {
  // @ts-ignore
  global.ReadableStream = class ReadableStream {
    constructor() {}
  };
}

if (typeof global.Request === 'undefined') {
  // @ts-ignore
  global.Request = class Request {
    constructor(url, init) {
      this.url = url;
      this.init = init || {};
    }
    async json() {
      return JSON.parse(this.init.body || '{}');
    }
  };
}

if (typeof global.Headers === 'undefined') {
  // @ts-ignore
  global.Headers = class Headers {
    constructor(init) {
      this._headers = {};
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers[key.toLowerCase()] = value;
        });
      }
    }
    get(name) {
      return this._headers[name.toLowerCase()];
    }
    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }
    has(name) {
      return name.toLowerCase() in this._headers;
    }
    delete(name) {
      delete this._headers[name.toLowerCase()];
    }
    getSetCookie() {
      return [];
    }
  };
}

if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.init = init || {};
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Headers(init.headers || {});
    }
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
    static json(body, init) {
      const headers = new Headers({ 'Content-Type': 'application/json', ...init?.headers });
      return new Response(JSON.stringify(body), { ...init, headers });
    }
  };
}
