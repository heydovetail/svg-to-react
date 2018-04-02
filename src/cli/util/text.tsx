export function firstUpperCase(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

export function hyphenToCamelCase(text: string) {
  return text.replace(/[-_](.)/g, (_, chr) => chr.toUpperCase());
}

export function fileNameToComponentName(fileName: string) {
  return firstUpperCase(hyphenToCamelCase(fileName));
}
