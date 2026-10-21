/** 限定公開ページの表示名。 */
export function sharePageTitle(mediaType: 'image' | 'video'): string {
  return mediaType === 'video' ? '動画' : '写真';
}

/**
 * ログインなしの1件表示HTMLを返す。
 * @description LINE のカードは og:title と og:image だけを使う。アルバム名は出さない。
 */
export function renderSharePage(input: {
  token: string;
  mediaType: 'image' | 'video';
  origin: string;
  hasPoster: boolean;
}): string {
  const title = sharePageTitle(input.mediaType);
  const mediaUrl = `${input.origin}/s/${input.token}/media`;
  const posterUrl = `${input.origin}/s/${input.token}/poster`;
  const imageTag =
    input.mediaType === 'video'
      ? `<video src="${mediaUrl}"${input.hasPoster ? ` poster="${posterUrl}"` : ''} controls playsinline></video>`
      : `<img src="${mediaUrl}" alt="${title}">`;
  const ogImage =
    input.mediaType === 'video'
      ? input.hasPoster
        ? posterUrl
        : ''
      : mediaUrl;

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${title}">
<meta property="og:type" content="website">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
<style>
  html,body{margin:0;height:100%;background:#111}
  body{display:flex;align-items:center;justify-content:center}
  img,video{max-width:100%;max-height:100dvh;object-fit:contain;background:#111}
</style>
</head>
<body>
${imageTag}
</body>
</html>`;
}
