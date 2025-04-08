
let userId = null;
const BACKEND_URL = "http://localhost:8000";

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  cryptoKey = await deriveKey(password);

  const res = await fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    const data = await res.json();
    userId = data.user_id;
    document.getElementById("vault").style.display = "block";
    loadCredentials();
  } else {
    alert("Login fallito");
  }
}

async function register() {
  const username = document.getElementById("reg_username").value;
  const password = document.getElementById("reg_password").value;

  const res = await fetch(`${BACKEND_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    alert("Registrazione completata. Ora puoi effettuare il login.");
  } else {
    alert("Errore nella registrazione.");
  }
}

async function saveCredential() {
  const service = document.getElementById("service").value;
  const login = document.getElementById("login").value;
  const pw = document.getElementById("pw").value;
  const notes = document.getElementById("notes").value;

  const encPw = await encrypt(pw);
  const encNotes = await encrypt(notes);

  await fetch(`${BACKEND_URL}/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      service,
      login,
      password_encrypted: JSON.stringify(encPw),
      notes_encrypted: JSON.stringify(encNotes)
    })
  });

  alert("Credenziale salvata!");
  loadCredentials();
}

async function loadCredentials() {
  const res = await fetch(`${BACKEND_URL}/credentials/${userId}`);
  const creds = await res.json();
  const list = document.getElementById("creds");
  list.innerHTML = "";

  for (const c of creds) {
    const pw = await decrypt(JSON.parse(c.password_encrypted));
    const notes = await decrypt(JSON.parse(c.notes_encrypted));
    const item = document.createElement("li");
    item.textContent = `🔐 ${c.service} | ${c.login} | ${pw} | ${notes}`;
    list.appendChild(item);
  }
}
