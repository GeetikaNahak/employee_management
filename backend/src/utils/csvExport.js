import { Parser } from "json2csv";

const exportCSV = (rows, fields) => {
  const parser = new Parser({ fields });
  return parser.parse(rows);
};

export default exportCSV;