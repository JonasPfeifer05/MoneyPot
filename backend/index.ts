import {kvsLocalStorage} from "@kvs/node-localstorage"

Bun.serve({
    port: 8080,
    async fetch(request: Request): Promise<Response> {
        const storage = await kvsLocalStorage({
            name: "money-pot",
            version: 1
        })

        async function get(): Promise<number[]> {
            let amount = await storage.get("amount");

            return amount === undefined ? [] : amount as number[]
        }

        async function set(amount: number[]) {
            await storage.set("amount", amount)
        }

        const url = new URL(request.url);
        let response;
        if (url.pathname === "/") {
            response = new Response(Bun.file(import.meta.dir + "/../html/index.html"))
        } else if (url.pathname === "/get") {
            response = Response.json({amount: await get()})
        } else if (url.pathname === "/add") {
            let current = await get();
            let addAmount = Number(await request.text())
            let newAmount = [addAmount, ...current];
            await set(newAmount)
            response = Response.json({amount: newAmount})
        } else {
            response = new Response("404", {status: 404});
        }

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        return response;
    }
})