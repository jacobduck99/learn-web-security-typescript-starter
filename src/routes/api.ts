import { Router } from "express";
import type { Dependencies } from "../dependencies.ts";
import { getCurrentSession } from "../auth/sessions.ts";
import {
    findOrderById,
    listAllOrders,
    listOrderItems,
    listOrdersForUser,
} from "../orders/index.ts";
import { findApiKey } from "../auth/apiKeys.ts";
import { listAllProducts } from "../products.ts";
import type { Product } from "../products.ts";
import type { Order, OrderItem } from "../orders/index.ts";

type ProductResponse = {
    id: number;
    name: string;
    description: string;
    image_path: string;
    price_cents: number;
};

type OrderResponse = {
    id: number;
    status: Order["status"];
    total_cents: number;
    created_at: string;
};

type OrderItemResponse = {
    product_id: number;
    product_name: string;
    quantity: number;
    price_cents: number;
};

function toProductReponse(product: Product): ProductResponse {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        image_path: product.image_path,
        price_cents: product.price_cents,
    };
}

function toOrderResponse(order: Order): OrderResponse {
    return {
        id: order.id,
        status: order.status,
        total_cents: order.total_cents,
        created_at: order.created_at,
    };
}

function toOrderItemResponse(order: OrderItem): OrderItemResponse {
    return {
        product_id: order.product_id,
        product_name: order.product_name,
        quantity: order.quantity,
        price_cents: order.price_cents,
    };
}

export function createApiRouter(deps: Dependencies): Router {
    const { db } = deps;
    const router = Router();

    router.get("/api/account/orders", (req, res) => {
        const current = getCurrentSession(db, req.header("cookie"));
        if (!current) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        res.json({ orders: listOrdersForUser(db, current.user.id) });
    });

    router.get("/api/orders/:id", (req, res) => {
        const current = getCurrentSession(db, req.header("cookie"));
        if (!current) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const orderId = Number(req.params.id);
        if (!Number.isSafeInteger(orderId)) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        const order = findOrderById(db, orderId);
        if (!order || current.user.id !== order.user_id) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        res.json({ order, items: listOrderItems(db, order.id) });
    });

    router.get("/api/products", (_req, res) => {
        res.json({ products: listAllProducts(db) });
    });

    router.get("/api/integrations/warehouse/orders", (_req, res) => {
        const orders = listAllOrders(db).map((order) => ({
            id: order.id,
            status: order.status,
            total_cents: order.total_cents,
            created_at: order.created_at,
        }));

        console.log("orders", orders);

        const apiKey = _req.header("x-api-key") as string;
        console.log("api key", apiKey);
        if (!apiKey) {
        }
        const getApi = findApiKey(db, apiKey);
        console.log("get api", getApi);
        if (!getApi || getApi === undefined) {
            res.status(401).json({ error: "key missing or invalid" });
            return;
        }

        if (getApi.scope !== "orders:read") {
            res.status(403).json({ error: "order has not been read" });
            return;
        }

        res.json({
            integration: "Warehouse Fulfillment Integration",
            orders,
        });
    });

    return router;
}
