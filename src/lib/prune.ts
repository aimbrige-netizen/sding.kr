const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

// 빈 문자열과 빈 배열을 재귀로 뺀다. 채워지지 않은 값이 구조화 데이터에 나가지 않게 한다(PLAN '구조화 데이터')
export function prune<T>(value: T): T {
  if (Array.isArray(value)) return value.map(prune).filter((item) => !isEmpty(item)) as T;
  if (value && typeof value === 'object') {
    const kept = Object.entries(value).map(([key, item]) => [key, prune(item)]).filter(([, item]) => !isEmpty(item));
    return Object.fromEntries(kept);
  }
  return value;
}
