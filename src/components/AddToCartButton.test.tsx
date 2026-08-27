import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Cart } from "@/types";
import { CartProvider } from "@/context/CartProvider";
import AddToCartButton from "./AddToCartButton";

const productId = 41;

const emptyCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: "0.00",
};

const cartWithProduct: Cart = {
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

function cartResponse(cart: Cart): Response {
  return Response.json(cart);
}

function deferredResponse() {
  let resolveResponse: ((response: Response) => void) | undefined;
  const response = new Promise<Response>((resolve) => {
    resolveResponse = resolve;
  });

  if (!resolveResponse) {
    throw new Error("Deferred response resolver was not initialized");
  }

  return { response, resolveResponse };
}

function renderButton() {
  render(
    <CartProvider>
      <AddToCartButton productId={productId} />
    </CartProvider>
  );
}

describe("AddToCartButton", () => {
  it("shows pending and successful states, then returns to idle", async () => {
    const pendingMutation = deferredResponse();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(cartResponse(emptyCart))
      .mockReturnValueOnce(pendingMutation.response);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    renderButton();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const addButton = screen.getByRole("button", { name: "Add item to cart" });
    await user.click(addButton);

    expect(addButton).toBeDisabled();
    expect(addButton).toHaveTextContent("Adding...");

    pendingMutation.resolveResponse(cartResponse(cartWithProduct));

    const addedButton = await screen.findByRole("button", {
      name: "Item added to cart",
    });
    expect(addedButton).toBeDisabled();
    expect(addedButton).toHaveTextContent("Added!");

    await waitFor(
      () =>
        expect(
          screen.getByRole("button", { name: "Add item to cart" })
        ).toBeEnabled(),
      { timeout: 2_500 }
    );
  });

  it("returns to idle when the cart request fails", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(cartResponse(emptyCart))
      .mockResolvedValueOnce(
        Response.json({ error: "test failure" }, { status: 500 })
      );
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    renderButton();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Add item to cart" }));

    await waitFor(() => expect(consoleError).toHaveBeenCalledOnce());
    const addButton = screen.getByRole("button", { name: "Add item to cart" });
    expect(addButton).toBeEnabled();
    expect(addButton).toHaveTextContent("Add to Cart");
    expect(addButton).not.toHaveTextContent("Added!");
  });
});
