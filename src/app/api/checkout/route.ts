import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { amountCents, customerName, customerPhone, description, redirectUrl } = await req.json();

    if (!amountCents) {
      return NextResponse.json({ error: "Valor não informado" }, { status: 400 });
    }

    const orderNsu = `WDB-EXTRAS-${Date.now()}`;

    const infinitePayResp = await axios.post(
      "https://api.infinitepay.io/invoices/public/checkout/links",
      {
        handle: "william-del-barrio",
        redirect_url: redirectUrl || "https://williamdelbarrio.com.br/dashboard/gallery",
        webhook_url: "https://williamdelbarrio.com.br", // Dummy webhook, Will verifies manually for now based on receipt
        order_nsu: orderNsu,
        items: [
          {
            quantity: 1,
            price: amountCents,
            description: description || "Fotos Extras - Estúdio William Del Barrio"
          }
        ],
        customer: {
          name: customerName || "Cliente WDB",
          phone_number: customerPhone || "+5511999999999" 
        }
      }
    );

    if (infinitePayResp.data && infinitePayResp.data.url) {
      return NextResponse.json({ url: infinitePayResp.data.url });
    } else {
      throw new Error("Invalid response from InfinitePay");
    }
  } catch (error: any) {
    console.error("[Checkout API Error]", error?.response?.data || error.message);
    return NextResponse.json({ error: "Erro ao gerar link de pagamento" }, { status: 500 });
  }
}
