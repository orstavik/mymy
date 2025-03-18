class Op {
  constructor(type, a, b) { this.type = type; this.a = a; this.b = b; }
  update(a, b) { this.a = a + this.a; this.b &&= b + this.b; }

  static bSide(ops) {
    return ops.map(op => op.type == "Equal" ? op.a : op.b ?? '').join("");
  }
  static aSide(ops) {
    return ops.map(op => op.a).join("");
  }
}

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

function backtrackToOps(table, A, B) {
  const res = [];
  let now, i = table.length - 1, j = table[0].length - 1;
  while (i > 0 && j > 0 && (now = table[i][j])) {
    const counter = now & 0xFF;
    if (counter) {
      i -= counter;
      j -= counter;
      res.unshift(new Op("Equal", A.substring(i, i + counter)));
    }
    else {
      const topLeft = table[i - 1][j - 1], top = table[i - 1][j], left = table[i][j - 1];
      const update = res[0] && res[0].type == "Replace";
      if (topLeft >= top && topLeft >= left)
        update ? res[0].update(A[--i], B[--j]) : res.unshift(new Op("Replace", A[--i], B[--j]));
      else if (top >= left)
        update ? res[0].update(A[--i], "") : res.unshift(new Op("Replace", A[--i], ""));
      else
        update ? res[0].update("", B[--j]) : res.unshift(new Op("Replace", "", B[--j]));
    }
  }
  if (j && i) res.unshift(new Op("Replace", A.substring(0, i), B.substring(0, j)));
  else if (j) res.unshift(new Op("Replace", "", B.substring(0, j)));
  else if (i) res.unshift(new Op("Replace", A.substring(0, i), ""));
  return res;
}

function printTable(str1, str2, resultTable) {
  const formatCell = num => `${num >> 22}|${(num >> 8) & 0x3FFF}|${num & 0xFF}`;
  const printTable = [
    ["%", ...str2.split("")],
    ...resultTable.slice(1).map((r, i) => [str1[i], ...r.slice(1).map(formatCell)])
  ];
  console.table(printTable);
}

// Example usage:
function test(str1, str2) {
  const table = customLevenshtein(str1, str2);
  const ops = backtrackToOps(table, str1, str2);
  const _str1 = Op.aSide(ops);
  const _str2 = Op.bSide(ops);
  console.log(str1 == _str1, str1, _str1);
  console.log(str2 == _str2, str2, _str2);
  // for (const op of ops)
  //   console.log(op, op.a, op.b);
  // printTable(str1, str2, table);
}

test("kitten", "sitting");
test("abc", "def");
test("abc", "abc");
test("a_b_cabc_ab_c", "abc");
