const form = document.getElementById("shortenerForm");
const input = document.getElementById("longLink");
const result = document.getElementById("result");
const message = document.getElementById("message");
const copyBtn = document.getElementById("copyBtn");

async function shortenUrl(url) {
  const response = await fetch("http://localhost:3000/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur lors du raccourcissement.");
  }

  return data.shortUrl;
}

copyBtn.addEventListener("click", async () => {
  const text = result.textContent.trim();

  if (!text || text === "exemple.com") {
    message.textContent = "Aucun lien à copier.";
    message.style.color = "#d14f00";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    message.textContent = "Lien copié !";
    message.style.color = "#0a7a1c";
    copyBtn.textContent = "Copié";
  } catch {
    message.textContent = "Copie impossible. Sélectionne manuellement.";
    message.style.color = "#d14f00";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const shortUrl = await shortenUrl(input.value);
    result.textContent = shortUrl;
    result.style.color = "#222";
    message.textContent = "Lien raccourci";
    message.style.color = "#0a7a1c";
    copyBtn.textContent = "Copier";
  } catch (error) {
    message.textContent = error.message;
    message.style.color = "#d14f00";
    result.textContent = "exemple.com";
    copyBtn.textContent = "Copier";
  }
});
