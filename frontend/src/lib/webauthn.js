// Helpers for talking to the real browser Web Authentication API
// (navigator.credentials.create / .get) which is what actually triggers
// the device's fingerprint / Face ID / Windows Hello prompt.

function base64urlToBuffer(base64url) {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buffer[i] = raw.charCodeAt(i);
  return buffer.buffer;
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function isWebAuthnSupported() {
  return typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof navigator.credentials?.create === 'function';
}

export async function registerFingerprint(optionsFromServer) {
  const publicKey = {
    ...optionsFromServer,
    challenge: base64urlToBuffer(optionsFromServer.challenge),
    user: {
      ...optionsFromServer.user,
      id: base64urlToBuffer(optionsFromServer.user.id),
    },
  };

  const credential = await navigator.credentials.create({ publicKey });

  return {
    attestationObject: bufferToBase64url(credential.response.attestationObject),
    clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
  };
}

export async function loginWithFingerprint(optionsFromServer) {
  const publicKey = {
    ...optionsFromServer,
    challenge: base64urlToBuffer(optionsFromServer.challenge),
  };

  const credential = await navigator.credentials.get({ publicKey });

  return {
    credentialId: bufferToBase64url(credential.rawId),
    authenticatorData: bufferToBase64url(credential.response.authenticatorData),
    clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
    signature: bufferToBase64url(credential.response.signature),
  };
}
