import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CartActionState } from "@/lib/cart/contract";
import AddToCartButton from "./AddToCartButton";

const actionMocks = vi.hoisted(() => ({
  addToCart: vi.fn(),
}));

vi.mock("@/app/actions/cart", () => ({
  addToCart: actionMocks.addToCart,
}));

const productId = 41;

function deferredAction() {
  let resolveAction: (state: CartActionState) => void = () => {
    throw new Error("Deferred action resolver was not initialized");
  };
  const promise = new Promise<CartActionState>((resolve) => {
    resolveAction = resolve;
  });

  return { promise, resolveAction };
}

describe("AddToCartButton", () => {
  it("submits a typed add command and shows pending and success states", async () => {
    const pendingAction = deferredAction();
    actionMocks.addToCart.mockReturnValueOnce(pendingAction.promise);
    const user = userEvent.setup();

    render(<AddToCartButton productId={productId} />);
    const addButton = screen.getByRole("button", { name: "Add item to cart" });
    await user.click(addButton);

    expect(addButton).toBeDisabled();
    expect(addButton).toHaveTextContent("Adding...");
    expect(actionMocks.addToCart).toHaveBeenCalledOnce();

    const formData: FormData = actionMocks.addToCart.mock.calls[0][1];
    expect(formData.get("productId")).toBe(String(productId));
    expect(formData.get("quantity")).toBe("1");

    pendingAction.resolveAction({ status: "success" });
    const addedButton = await screen.findByRole("button", {
      name: "Item added to cart",
    });
    expect(addedButton).toBeEnabled();
    expect(addedButton).toHaveTextContent("Added!");
  });

  it("shows a recoverable error and allows another submission", async () => {
    actionMocks.addToCart
      .mockResolvedValueOnce({
        status: "error",
        code: "product-unavailable",
        message: "This product is no longer available.",
      })
      .mockResolvedValueOnce({ status: "success" });
    const user = userEvent.setup();

    render(<AddToCartButton productId={productId} />);
    await user.click(screen.getByRole("button", { name: "Add item to cart" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This product is no longer available."
    );
    const retryButton = screen.getByRole("button", {
      name: "Add item to cart",
    });
    expect(retryButton).toBeEnabled();

    await user.click(retryButton);
    await waitFor(() => expect(actionMocks.addToCart).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByRole("button", { name: "Item added to cart" })
    ).toBeEnabled();
  });
});
