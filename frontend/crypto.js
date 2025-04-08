
let cryptoKey = null;

async function deriveKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  return window.crypto.subtle.deriveKey({
    name: "PBKDF2",
    salt: enc.encode("salt_webapp"),
    iterations: 100000,
    hash: "SHA-256"
  }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function encrypt(text) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, cryptoKey, enc.encode(text));
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

async function decrypt(data) {
  const dec = new TextDecoder();
  const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(data.encrypted), c => c.charCodeAt(0));
  const plain = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, cryptoKey, ct);
  return dec.decode(plain);
}
