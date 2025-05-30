
let userId = null;

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  cryptoKey = await deriveKey(password);

  const res = await fetch("http://localhost:8000/login", {
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
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:8000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    alert("Registrazione completata, ora effettua il login.");
  } else {
    alert("Errore durante la registrazione.");
  }
}

async function saveCredential() {
  const service = document.getElementById("service").value;
  const login = document.getElementById("login").value;
  const pw = document.getElementById("pw").value;
  const notes = document.getElementById("notes").value;

  const encPw = await encrypt(pw);
  const encNotes = await encrypt(notes);

  await fetch("http://localhost:8000/credentials", {
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
  const res = await fetch(`http://localhost:8000/credentials/${userId}`);
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
