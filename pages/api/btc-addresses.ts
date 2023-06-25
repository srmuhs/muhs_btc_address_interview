import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export default (_: NextApiRequest, res: NextApiResponse) => {
  const csvFilePath = path.resolve(
    "./data/Coin_Metrics_Network_Data_2023-02-02T14-32.csv"
  );
  const csvFileContent = fs.readFileSync(csvFilePath, "utf-8");

  Papa.parse(csvFileContent, {
    header: true,
    complete: result => {
      res.status(200).json(result.data);
    },
    error: (error: { toString: () => any }) => {
      res.status(500).json({ error: error.toString() });
    }
  });
};
