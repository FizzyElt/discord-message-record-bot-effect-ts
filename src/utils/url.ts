const twitterRegex = /^https?:\/\/(www\.)?(twitter|x)\.com/;

export function isValidTwitterUrl(url: string) {
  return twitterRegex.test(url);
}

export function replaceTwitterUrl(url: string) {
  return url.replace(twitterRegex, "https://fixupx.com");
}
