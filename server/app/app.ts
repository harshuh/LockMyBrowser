import express from "express";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: "Apis Is Running Fine"});
});


const PORT =  3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
