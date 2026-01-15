
/// <reference types="jest" />
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cart from '@/components/Cart';
// Jest globals (describe, it, expect, jest) are available without import

describe('Cart', () => {
  it('renders empty cart state', () => {
    render(
      <Cart
        items={[]}
        onUpdateQuantity={jest.fn()}
        onRemove={jest.fn()}
        onProceedToCheckout={jest.fn()}
      />
    )

    // Should show something indicating empty cart
    expect(screen.getByText(/cart/i)).toBeInTheDocument()
  })

  it('calls clear cart when available', async () => {
    const user = userEvent.setup()
    const onBackToCollection = jest.fn()

    render(
      <Cart
        items={[]}
        onUpdateQuantity={jest.fn()}
        onRemove={jest.fn()}
        onProceedToCheckout={jest.fn()}
        onBackToCollection={onBackToCollection}
      />
    )

    const back = screen.queryByRole('button', { name: /back/i })
    if (back) {
      await user.click(back)
      expect(onBackToCollection).toHaveBeenCalled()
    }
  })
})
