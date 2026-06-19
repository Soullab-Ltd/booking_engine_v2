const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'span',
  'div',
]);

const unwrapNode = (node: Element) => {
  const parent = node.parentNode;
  if (!parent) return;

  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node);
  }

  parent.removeChild(node);
};

const sanitizeHtmlDocument = (root: ParentNode) => {
  const elements = Array.from(root.querySelectorAll('*'));

  elements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      unwrapNode(element);
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();
      if (attributeName === 'style' || attributeName.startsWith('on')) {
        element.removeAttribute(attribute.name);
      }
    });
  });
};

export const stripHtml = (value: unknown): string => {
  const html = String(value || '').trim();
  if (!html) return '';

  if (typeof window === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
};

export const sanitizeRichText = (value: unknown): string => {
  const html = String(value || '').trim();
  if (!html) return '';

  if (typeof window === 'undefined') {
    return html;
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  sanitizeHtmlDocument(doc.body);
  return doc.body.innerHTML.trim();
};

const stripNonLatinText = (value: string): string => {
  try {
    return value
      .replace(/[^\p{Script=Latin}\p{Number}\p{Punctuation}\p{Separator}\p{Symbol}]/gu, '')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .trim();
  } catch {
    return value.trim();
  }
};

export const sanitizeEnglishRichText = (value: unknown): string => {
  const html = String(value || '').trim();
  if (!html) return '';

  if (typeof window === 'undefined') {
    return stripNonLatinText(html);
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  sanitizeHtmlDocument(doc.body);

  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();

  while (currentNode) {
    currentNode.textContent = stripNonLatinText(currentNode.textContent || '');
    currentNode = walker.nextNode();
  }

  return doc.body.innerHTML.trim();
};
