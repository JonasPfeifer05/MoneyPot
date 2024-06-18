import {kvsLocalStorage} from "@kvs/node-localstorage"

Bun.serve({
    port: 8080,
    async fetch(request: Request): Promise<Response> {
        const storage = await kvsLocalStorage({
            name: "money-pot",
            version: 1
        })

        async function getHistory(): Promise<number[]> {
            let amount = await storage.get("amount");

            return amount === undefined ? [] : amount as number[]
        }

        async function setHistory(amount: number[]) {
            await storage.set("amount", amount)
        }

        async function getVisits(): Promise<number> {
            let visits = await storage.get("visits");
            return visits == undefined ? 0 : visits as number
        }

        async function setVisits(visits: number) {
            await storage.set("visits", visits)
        }

        const url = new URL(request.url);
        let response;
        if (url.pathname === "/" && request.method === "GET") {
            response = new Response(Bun.file(import.meta.dir + "/../html/index.html"))
        } else if (url.pathname === "/get" && request.method === "GET") {
            response = Response.json({history: await getHistory(), visits: await getVisits()})
        } else if (url.pathname === "/entry" && request.method === "POST") {
            let current = await getHistory();
            let entry = await request.json()
            let newHistory = [entry, ...current];
            await setHistory(newHistory)
            response = Response.json({history: newHistory, visits: await getVisits()})
        } else if (url.pathname === "/entry" && request.method === "DELETE") {
            let index = Number(await request.text())
            let current = await getHistory();
            current.splice(index, 1)
            await setHistory(current)
            response = Response.json({history: current, visits: await getVisits()})
        } else if (url.pathname === "/visits" && request.method === "POST") {
            let current = await getVisits()
            let newVisits = current + 1
            await setVisits(newVisits)
            response = Response.json({history: await getHistory(), visits: newVisits})
        } else if (url.pathname === "/visits" && request.method === "DELETE") {
            let current = await getVisits()
            let newVisits = current - 1
            await setVisits(newVisits)
            response = Response.json({history: await getHistory(), visits: newVisits})
        } else {
            response = new Response("404", {status: 404});
        }

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        return response;
    }
})