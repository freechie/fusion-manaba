import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CartLineForm from "./CartLineForm";

const actionMocks = vi.hoisted(() => ({
  removeFromCart: vi.fn(),
  setCartQuantity: vi.fn(),
}));

vi.mock("@/app/actions/cart", () => actionMocks);

describe("CartLineForm", () => {
  it("submits quantity updates and removals with the product id", async () => {
    actionMocks.setCartQuantity.mockResolvedValue({ status: "success" });
    actionMocks.removeFromCart.mockResolvedValue({ status: "success" });
    const user = userEvent.setup();

    render(
      <CartLineForm productId={41} productName="Test Product" quantity={2} />
    );

    const quantityInput = screen.getByRole("spinbutton", {
      name: "Quantity for Test Product",
    });
    await user.clear(quantityInput);
    await user.type(quantityInput, "4");
    await user.click(screen.getByRole("button", { name: "Update" }));

    const updateData: FormData =
      actionMocks.setCartQuantity.mock.calls[0][1];
    expect(updateData.get("productId")).toBe("41");
    expect(updateData.get("quantity")).toBe("4");

    await user.click(screen.getByRole("button", { name: "Remove" }));
    const removeData: FormData = actionMocks.removeFromCart.mock.calls[0][1];
    expect(removeData.get("productId")).toBe("41");
  });

  it("shows server action errors without losing the controls", async () => {
    actionMocks.setCartQuantity.mockResolvedValue({
      status: "error",
      code: "quantity-limit",
      message: "Each cart item is limited to 99.",
    });
    const user = userEvent.setup();

    render(
      <CartLineForm productId={41} productName="Test Product" quantity={2} />
    );
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Each cart item is limited to 99."
    );
    expect(screen.getByRole("button", { name: "Update" })).toBeEnabled();
  });
});
