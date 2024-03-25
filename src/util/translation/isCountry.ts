export default function isCountry(key: string): key is `country:${string}` {
  return key.startsWith('country:');
}
