import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL); // URL do Redis configurada como variável de ambiente

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { descricao, valor } = req.body;
        if (!descricao || !valor) {
            return res.status(400).json({ error: "Descrição e valor são obrigatórios." });
        }

        // Adiciona dado com expiração de 12 horas
        const id = `dado:${Date.now()}`; // Gera uma chave única
        await redis.setex(id, 43200, JSON.stringify({ descricao, valor })); // 43200 segundos = 12 horas

        return res.status(201).json({ message: "Dado adicionado com sucesso!", id });
    } else if (req.method === 'GET') {
        const keys = await redis.keys("dado:*");
        const values = await Promise.all(keys.map(key => redis.get(key)));
        const dados = values.map(value => JSON.parse(value));

        return res.status(200).json(dados);
    } else {
        return res.status(405).json({ error: "Método não permitido." });
    }
}
