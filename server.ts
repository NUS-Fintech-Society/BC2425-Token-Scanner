import express from "express";
import fetch from "node-fetch";

const app = express();
const port = 3000;
const cookie =
    "auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiNENQM2hpZjFXbzJ5SG9HU0Y0anZLcEhzYVFhblQ4Y3pUV1ZOVUVDQTZlVmEiLCJyb2xlcyI6WyJ1c2VyIl0sImdyb3VwIjoiY29udHJvbCIsImVyYSI6IkZFQVRVUkVEIHYxLjYiLCJpYXQiOjE3MjkxNzA3MDAsImV4cCI6MTczMTc2MjcwMH0.rB-93MRQrZoZyxmvYjmV8oI8MtUiyozZsP1-xUQwfv8; cf_clearance=.a7QFYT8F913FkZT.Fux41pP_ga2GcmzQtC16NG6Xm8-1730293467-1.2.1.1-CipIP4mIi9u24uk1QyuNh66IAXhLZ8MTrxePf19AM.08m2qCGoppA518bWT5ZLCJ4cbPVE9CgJdnFHKYaHlg0b.Nlt0xEPiTAjY8Aq_8MtLknJ5LBT2gQVFDqga1fFxGSNQdgQPh_R2szcCQDBP9ehrbfU2INiKHp_QHhPRlQSi20BCDxxs6qEwoSMQg_8blfHARKJ7Lk7Cs2gVY6ER.Gra1xCEeG338JGQ53kpN_i7yT5rJev7LvkJlAAChEo325eOZC7JYpGsBF8T5dv69sjKTCcsfkddg_ALZlLvJgmw10Y6F1LPpt5UOnBSh2B_rEKs7R2mw7EnzsEJPyYpUjmNZ_qhsWkkz72Men9bWa_.lFVptfs11ddTxNW7L6lq9Y1TvBudjKa4PutI89X7p4g; __cf_bm=EA.ma6nHqgs0aHSiOKLSDGf.4KfGslEAahShSWUFePg-1730293487-1.0.1.1-psHUdhP.Z47ywciIBQYFlneiOq0IQsQ2Nkbwbh1Hnkas1L6YeuF_2k89xq2Cyy9NipzbGPC.IN.P9vsrh0xQMA";

const keywords: string[] = [
    "cto",
    "community takeover",
    "takeover",
    "take over",
];
const latestMessageAPI: string =
    "https://frontend-api.pump.fun/replies?limit=100&offset=0";
const numMentioned: bigint = BigInt(5);

interface TokenInfo {
    tokenCA: string;
    dexPaid: boolean;
}

interface ApiResponse {
    id: number;
    mint: string;
    file_uri: string | null;
    text: string;
    user: string;
    timestamp: number;
    hidden: boolean;
    is_banned: boolean;
}

interface DexPaid {
    type: string;
    status: string;
    paymentTimestamp: number;
}

function checkMessage(latestMessage: string): boolean {
    latestMessage = latestMessage.toLowerCase();
    return keywords.some((keyword) => latestMessage.includes(keyword));
}

async function getLatestMessages(
    latestMessageAPI: string
): Promise<ApiResponse[]> {
    const latestMessage = await fetch(latestMessageAPI, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
        },
    });
    if (!latestMessage.ok) throw new Error("Failed to fetch messages");
    return (await latestMessage.json()) as ApiResponse[];
}

async function checkDexPaid(tokenCA: string): Promise<boolean> {
    const api = `https://api.dexscreener.com/v1/orders/solana/${tokenCA}`;
    const response = await fetch(api, {
        headers: {
            Cookie: "your-cookie-here",
        },
    });
    if (!response.ok) throw new Error("Failed to check DexPaid status");
    const data: DexPaid = (await response.json()) as DexPaid;
    return data.status === "approved";
}

async function getValidTokens(): Promise<string[]> {
    const validMints: string[] = [];
    const finalValidMints: string[] = [];

    const latestMessages = await getLatestMessages(latestMessageAPI);

    for (const message of latestMessages) {
        if (checkMessage(message.text)) {
            validMints.push(message.mint);
        }
    }
    console.log(validMints);

    for (const mint of validMints) {
        const dexPaidBool = await checkDexPaid(mint);
        if (dexPaidBool) {
            finalValidMints.push(mint);
        }
    }
    console.log(finalValidMints);

    return finalValidMints;
}

app.get("/tokens", async (req, res) => {
    try {
        const validTokens = await getValidTokens();
        res.status(200).json({ tokens: validTokens });
    } catch (error) {
        res.status(500).json({ error: "Error fetching valid tokens" });
    }
});

app.get("/ping", async (req, res) => {
    try {
        res.status(200).json({ message: "pong" });
    } catch (error) {
        res.status(500).json({ error: "pong" });
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
