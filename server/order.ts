"use server";
import { requireUser } from "@/auth/auth-helper";
import { getOrderById } from "@/lib/orders/order.service";

export async function getOrder(orderId: string) {
  try {
    const user = await requireUser();

    const userId = user.id;

    const order = await getOrderById({
      orderId,
      userId,
    });

    return order;
  } catch (error) {
    console.error(`Error fetching order with id ${orderId}:`, error);
    throw error;
  }
}
