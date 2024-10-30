//poll the API for the latest message 
import fetch from "node-fetch";

const keywords: string[] = ["cto", "community takeover", "takeover", "take over"];
const latestMessageAPI : string = "https://frontend-api.pump.fun/replies?limit=100&offset=0";
const numMentioned: bigint = BigInt(5);

//TokenInfo Interface for returning the final output
interface TokenInfo {
    tokenCA : string; 
    dexPaid : boolean;
}

//each of the  main responses
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
//used for checkAllMessages
interface AllMessages {
    signature: string | null;
    is_buy: boolean | null;
    sol_amount: number | null;
    id: number;
    mint: string;
    file_uri: string | null;
    text: string;
    user: string;
    timestamp: number;
    total_likes: number;
    username: string | null;
    profile_image: string | null;
    liked_by_user: boolean;
}


//response for checkDexPaid 
interface DexPaid {
    type: string; 
    status: string;
    paymentTimestamp: number;
}


//check if there are any of the terms in the latest message
function checkMessage(latestMessage: string) : boolean {
    latestMessage = latestMessage.toLowerCase(); 
    for (let i = 0; i < keywords.length; i++) {
        if (latestMessage.includes(keywords[i])) {
            return true;
        }
    }
    return false;
}


async function getLatestMessages(latestMessageAPI: string) : Promise<ApiResponse[]> {
    try {
        const latestMessage = await fetch (latestMessageAPI, {
            method: 'GET', 
            headers:{
                'Content-Type': 'application/json',
                'Cookie': 'cf_clearance=TYM.TJY0aldyBFyW6FKWMRwj4Ml40VNEp2YAR5jHUeI-1729685434-1.2.1.1-NiA2CzQZ1.Q16Ofj78oAryPD2mTlIYZBq5RXUQp8ZHrHvxeq.SIX4c66XccF3bqwGFQhTV1GCKKUmZF5RU9tY1v1SPs04MUWtbLD8qjuEX4Hj74psl9hBvmb.rRzYqZTWruouyS9vBQAaIGb3OcvKf_r_wc45Y3eEvIbg26YOGuQ5F31zJ917D4q2jY0yPU1R1BZBBYvmzkV6i.msiHMxEej7p1QZ75Gy4tZSwU9_81gQfwfPDQzmUjhSMY60CjERSp74sAVUCyhb9nYEAYBQAwYly9aMX6W_ucvFwFUXfjn_.JwwQx7DBWx6AOAX2oLraqlmKSFJMM5UDUZMibYMYrw_Hewoo.U.oBCte6f.IjuCd8yuaNjW.VtbjWv2HxlrViLy4Zy1E2N.kYR5rHTTg; _ga=GA1.1.1441094035.1729685882; auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiSjNyYVV6Z0IyRWdwaXM2WVc2RENLWGZGU1lpZGZpU1FEenA0bnliOVY0QlIiLCJyb2xlcyI6WyJ1c2VyIl0sImdyb3VwIjoidGVzdCIsImVyYSI6IkZFQVRVUkVEIHYxLjYiLCJpYXQiOjE3Mjk2ODU5MDksImV4cCI6MTczMjI3NzkwOX0.L1hDw-FLxyvA7IL3rfRJKvfu1Xv1vU8gMBU_nQgUsVU; fs_uid=#o-1YWTMD-na1#240711f0-3ec6-4289-9596-8c80db777042:42fa7ccf-c4eb-40d3-a7fc-4791cd73de1b:1729685882048::1#a9cd0765#/1761221885; _ga_T65NVS2TQ6=GS1.1.1729689935.2.0.1729689935.0.0.0; __cf_bm=TTNwmLfNQInJMcsUymzPpNf5QDLWUB56qO_USFmsSIQ-1730291337-1.0.1.1-uqxutW_iEd8pK2JI3.Hv1mg6sfUjUllmwrairFwSFFsqA6lQFbbVHLsDlaowX1V3BL2eJVmluB6TnxMv_UdPSw',
            } 
        });

        if (!latestMessage.ok) {
            const errorResponse = (await latestMessage.json()) as ApiResponse;
            throw new Error("message");
        }

        const data = (await latestMessage.json()) as ApiResponse[];
        return data; 

    } catch (error) {
        console.error("Error fetching replies:", error);
        throw error;    
    }
    
}


// async function checkAllMessages(tokenCA : string) : Promise<boolean>  {
//     const messagesApi = `https://frontend-api.pump.fun/replies/${tokenCA}?limit=100&offset=0&user=%2A`;
    
//     try {
//         const response = await fetch(messagesApi, {
//             method: 'GET', 
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Cookie': 'cf_clearance=TYM.TJY0aldyBFyW6FKWMRwj4Ml40VNEp2YAR5jHUeI-1729685434-1.2.1.1-NiA2CzQZ1.Q16Ofj78oAryPD2mTlIYZBq5RXUQp8ZHrHvxeq.SIX4c66XccF3bqwGFQhTV1GCKKUmZF5RU9tY1v1SPs04MUWtbLD8qjuEX4Hj74psl9hBvmb.rRzYqZTWruouyS9vBQAaIGb3OcvKf_r_wc45Y3eEvIbg26YOGuQ5F31zJ917D4q2jY0yPU1R1BZBBYvmzkV6i.msiHMxEej7p1QZ75Gy4tZSwU9_81gQfwfPDQzmUjhSMY60CjERSp74sAVUCyhb9nYEAYBQAwYly9aMX6W_ucvFwFUXfjn_.JwwQx7DBWx6AOAX2oLraqlmKSFJMM5UDUZMibYMYrw_Hewoo.U.oBCte6f.IjuCd8yuaNjW.VtbjWv2HxlrViLy4Zy1E2N.kYR5rHTTg; _ga=GA1.1.1441094035.1729685882; auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiSjNyYVV6Z0IyRWdwaXM2WVc2RENLWGZGU1lpZGZpU1FEenA0bnliOVY0QlIiLCJyb2xlcyI6WyJ1c2VyIl0sImdyb3VwIjoidGVzdCIsImVyYSI6IkZFQVRVUkVEIHYxLjYiLCJpYXQiOjE3Mjk2ODU5MDksImV4cCI6MTczMjI3NzkwOX0.L1hDw-FLxyvA7IL3rfRJKvfu1Xv1vU8gMBU_nQgUsVU; fs_uid=#o-1YWTMD-na1#240711f0-3ec6-4289-9596-8c80db777042:42fa7ccf-c4eb-40d3-a7fc-4791cd73de1b:1729685882048::1#a9cd0765#/1761221885; _ga_T65NVS2TQ6=GS1.1.1729689935.2.0.1729689935.0.0.0; __cf_bm=TTNwmLfNQInJMcsUymzPpNf5QDLWUB56qO_USFmsSIQ-1730291337-1.0.1.1-uqxutW_iEd8pK2JI3.Hv1mg6sfUjUllmwrairFwSFFsqA6lQFbbVHLsDlaowX1V3BL2eJVmluB6TnxMv_UdPSw',
//             }
//         }); 
//         if (!response.ok) {
//             throw new Error(`Http error. Status: ${response.status}`); 
//         }
//         const data = await response.json() as AllMessages[];
//         const texts = data.map((item: { text: string }) => item.text); 
//         console.log(texts); 
//         let count = 0;

//         for (let i = 0; i < texts.length; i++) {
//             const b = checkMessage(texts[i]); 
//             if (b) {
//                 count += 1; 
//             }
//         }
//         return count > numMentioned;

//     } catch (error) {
//         console.error("Error fetching data:", error);
//         return false;
//     }
    
// }

async function checkDexPaid(tokenCA : string) : Promise<Boolean> {
    const api = "https://api.dexscreener.com/v1/orders/solana/" + tokenCA;
    try {
        const response = await fetch(api, {
            headers : {
                'Cookie': 'cf_clearance=TYM.TJY0aldyBFyW6FKWMRwj4Ml40VNEp2YAR5jHUeI-1729685434-1.2.1.1-NiA2CzQZ1.Q16Ofj78oAryPD2mTlIYZBq5RXUQp8ZHrHvxeq.SIX4c66XccF3bqwGFQhTV1GCKKUmZF5RU9tY1v1SPs04MUWtbLD8qjuEX4Hj74psl9hBvmb.rRzYqZTWruouyS9vBQAaIGb3OcvKf_r_wc45Y3eEvIbg26YOGuQ5F31zJ917D4q2jY0yPU1R1BZBBYvmzkV6i.msiHMxEej7p1QZ75Gy4tZSwU9_81gQfwfPDQzmUjhSMY60CjERSp74sAVUCyhb9nYEAYBQAwYly9aMX6W_ucvFwFUXfjn_.JwwQx7DBWx6AOAX2oLraqlmKSFJMM5UDUZMibYMYrw_Hewoo.U.oBCte6f.IjuCd8yuaNjW.VtbjWv2HxlrViLy4Zy1E2N.kYR5rHTTg; _ga=GA1.1.1441094035.1729685882; auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiSjNyYVV6Z0IyRWdwaXM2WVc2RENLWGZGU1lpZGZpU1FEenA0bnliOVY0QlIiLCJyb2xlcyI6WyJ1c2VyIl0sImdyb3VwIjoidGVzdCIsImVyYSI6IkZFQVRVUkVEIHYxLjYiLCJpYXQiOjE3Mjk2ODU5MDksImV4cCI6MTczMjI3NzkwOX0.L1hDw-FLxyvA7IL3rfRJKvfu1Xv1vU8gMBU_nQgUsVU; fs_uid=#o-1YWTMD-na1#240711f0-3ec6-4289-9596-8c80db777042:42fa7ccf-c4eb-40d3-a7fc-4791cd73de1b:1729685882048::1#a9cd0765#/1761221885; _ga_T65NVS2TQ6=GS1.1.1729689935.2.0.1729689935.0.0.0; __cf_bm=TTNwmLfNQInJMcsUymzPpNf5QDLWUB56qO_USFmsSIQ-1730291337-1.0.1.1-uqxutW_iEd8pK2JI3.Hv1mg6sfUjUllmwrairFwSFFsqA6lQFbbVHLsDlaowX1V3BL2eJVmluB6TnxMv_UdPSw',
            }
        });
        if (!response.ok) {
            throw new Error("Http error. Status: ${response.status}"); 
        }
        const data: DexPaid = await response.json() as DexPaid;
        
        return data.status == "approved";

    } catch (error) {
        console.error("Error fetching data:", error);
        return false;
    }
}


async function main() : Promise<void> {
    
    const validMints: string[] = [];
    const finalValidMints: string[] = [];
    
    const intervalId = setInterval(async () => {
        try {
            const latestMessage = await getLatestMessages(latestMessageAPI); 
            console.log(latestMessage); 
            
            for (const message of latestMessage) {
                console.log("Checking message: " + message.text);
                
                if (checkMessage(message.text)) {
                    validMints.push(message.mint);
                }
            }

            for (const mint of validMints) {
                console.log("Checking mints: " + mint); 
                // const takeOverBool = await checkAllMessages(mint);
                const dexPaidBool = await checkDexPaid(mint);
                // if (takeOverBool && dexPaidBool) {
                if (dexPaidBool) {                    
                    console.log("Both true");
                    finalValidMints.push(mint);
                } else {
                    console.log("False");
                }
            }

        } catch (error) {
            console.error("Error fetching latest messages:", error);
        }
    }, 10000);

    
    setTimeout(() => {
        clearInterval(intervalId);
        console.log("Stopped repeating the action.");

        // Print out all the final valid mints
        if (finalValidMints.length > 0) {
            console.log("Final valid mints: ", finalValidMints);
        } else {
            console.log("No valid mints found.");
        }

    }, 60000);

    

}
await main();