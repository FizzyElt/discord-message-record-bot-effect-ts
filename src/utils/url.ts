const twitterRegex = /^https?:\/\/(www\.)?(twitter|x)\.com/;

export function isValidTwitterUrl(url: string): boolean {
    return twitterRegex.test(url);
}

export function replaceTwitterUrl(url: string): string {
    return url.replace(twitterRegex, "https://fixupx.com");
}
