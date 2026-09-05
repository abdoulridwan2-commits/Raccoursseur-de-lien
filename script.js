const form = document.getElementById('shortenerForm');
const input = document.getElementById('longLink');
const result = document.getElementById('result');
const message = document.getElementById('message');

function generateShortCode(url) {
  const cleanUrl = url.trim();

  if (!cleanUrl) {
    throw new Error('Veuillez entrer un lien valide.');
  }

  let normalizedUrl = cleanUrl;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const parsedUrl = new URL(normalizedUrl);

  if (!parsedUrl.hostname || !parsedUrl.protocol.includes('http')) {
    throw new Error('Le lien doit commencer par http:// ou https://');
  }

  const text = `${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`;
  const hash = [...text]
    .reduce((total, char) => ((total * 31 + char.charCodeAt(0)) >>> 0), 0)
    .toString(36)
    .slice(0, 8);

  return `https://exple.com/${hash}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  try {
    const shortUrl = generateShortCode(input.value);
    result.textContent = shortUrl;
    result.style.color = '#222';
    message.textContent = 'Lien raccourci';
    message.style.color = '#0a7a1c';
  } catch (error) {
    message.textContent = error.message;
    message.style.color = '#d14f00';
    result.textContent = 'exple.com';
  }
});
