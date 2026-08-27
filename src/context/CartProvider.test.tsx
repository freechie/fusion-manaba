import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Cart } from "@/types";
import { CartProvider, useCart } from "./CartProvider";

const productId = 41;

const emptyCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: "0.00",
};

const oneItemCart: Cart = {
  items: [
    {
      productId,
      name: "Test Product",
      price: "4.25",
      quantity: 1,
      total: "4.25",
    },
  ],
  totalItems: 1,
  totalPrice: "4.25",
};

const twoItemCart: Cart = {
  items: [{ ...oneItemCart.items[0], quantity: 2, total: "8.50" }],
  totalItems: 2,
  totalPrice: "8.50",
};

function cartResponse(cart: Cart): Response {
  return Response.json(cart);
}

function CartProbe() {
  const { cart, loading, addItem, updateItem, removeItem } = useCart();

  return (
    <>
      <output aria-label="Cart summary">
        {cart.totalItems} items, ${cart.totalPrice}
      </output>
      <output aria-label="Cart request status">
        {loading ? "loading" : "idle"}
      </output>
      <button type="button" onClick={() => void addItem(productId, 1)}>
        Add
      </button>
      <button type="button" onClick={() => void updateItem(productId, 2)}>
        Update
      </button>
      <button type="button" onClick={() => void removeItem(productId)}>
        Remove
      </button>
    </>
  );
}

describe("CartProvider", () => {
  it("loads the current cart when the provider mounts", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      cartResponse(twoItemCart)
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    );

    expect(
      await screen.findByRole("status", { name: "Cart summary" })
    ).toHaveTextContent("2 items, $8.50");
    expect(
      screen.getByRole("status", { name: "Cart request status" })
    ).toHaveTextContent("idle");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/cart");
  });

  it("sends add, update, and remove mutations and stores each response", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(cartResponse(emptyCart))
      .mockResolvedValueOnce(cartResponse(oneItemCart))
      .mockResolvedValueOnce(cartResponse(twoItemCart))
      .mockResolvedValueOnce(cartResponse(emptyCart));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() =>
      expect(screen.getByRole("status", { name: "Cart summary" })).toHaveTextContent(
        "1 items, $4.25"
      )
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", productId, quantity: 1 }),
    });

    await user.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() =>
      expect(screen.getByRole("status", { name: "Cart summary" })).toHaveTextContent(
        "2 items, $8.50"
      )
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", productId, quantity: 2 }),
    });

    await user.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() =>
      expect(screen.getByRole("status", { name: "Cart summary" })).toHaveTextContent(
        "0 items, $0.00"
      )
    );
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", productId }),
    });
  });

  it("keeps the empty cart and finishes loading when the response is invalid", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ items: [] }));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    );

    await waitFor(() => expect(consoleError).toHaveBeenCalledOnce());
    expect(
      screen.getByRole("status", { name: "Cart summary" })
    ).toHaveTextContent("0 items, $0.00");
    expect(
      screen.getByRole("status", { name: "Cart request status" })
    ).toHaveTextContent("idle");
  });
});
