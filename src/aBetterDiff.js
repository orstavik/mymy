function customLevenshtein(A, B) {
  const height = A.length;
  const width = B.length;
  const table = Array.from({ length: height + 1 }, _ => Array(width + 1).fill(0));
  for (let i1 = 0, i2 = 1; i1 < height; i1++, i2++)
    for (let j1 = 0, j2 = 1; j1 < width; j1++, j2++)
      table[i2][j2] = A[i1] === B[j1] ?
        Math.max(table[i2][j1], table[i1][j2], table[i1][j1] + (1 << 22) + (Math.pow(table[i1][j1] & 0xFF, 2) << 8) + 1) :
        Math.max(table[i2][j1], table[i1][j2]) & ~0xFF;
  return table;
}

export function diff(A, B) {
  const table = customLevenshtein(A, B);
  const res = [];
  let now, i = table.length - 1, j = table[0].length - 1;
  while (i > 0 && j > 0 && (now = table[i][j])) {
    const equals = now & 0xFF;
    if (equals) {
      i -= equals;
      j -= equals;
      const str = A.slice(i, i + equals);
      res.unshift({ a: str, b: str });
    } else {
      const topLeft = table[i - 1][j - 1], top = table[i - 1][j], left = table[i][j - 1];
      const a = (topLeft >= top && topLeft >= left) || top >= left ? A[--i] : "";
      const b = (topLeft >= top && topLeft >= left) || left > top ? B[--j] : "";
      res[0]?.a == res[0]?.b ? res.unshift({ a, b }) :
        (res[0].a = a + res[0].a, res[0].b = b + res[0].b);
    }
  }
  if (i || j)
    res.unshift({ a: A.slice(0, i), b: B.slice(0, j) });
  return res;
}

function printTable(str1, str2) {
  const resultTable = customLevenshtein(str1, str2);
  const formatCell = num => `${num >> 22}|${(num >> 8) & 0x3FFF}|${num & 0xFF}`;
  const printTable = [
    ["%", ...str2.split("")],
    ...resultTable.slice(1).map((r, i) => [str1[i], ...r.slice(1).map(formatCell)])
  ];
  console.table(printTable);
}

function test(str1, str2) {
  const ops = diff(str1, str2);
  console.log(
    `diff(${str1},${str2}): ${str1 == ops.map(op => op.a).join("")}, ${str2 == ops.map(op => op.b).join("")}`);
}

function debug(str1, str2){
  test(str1, str2);
  const ops = diff(str1, str2);
  for (const op of ops)
    console.log(op, op.a, op.b);
  printTable(str1, str2);
}

test("kitten", "sitting");
test("abc", "def");
test("abc", "abc");
test("a_b_cabc_ab_c", "abc");
