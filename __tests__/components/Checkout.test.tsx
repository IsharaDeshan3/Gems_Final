/// <reference types="jest" />
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react'
import Checkout from '@/components/Checkout'

jest.mock('@/utils/api', () => ({
  __esModule: true,
  createOrder: jest.fn(async () => ({ id: 'order1' })),
}))

jest.mock('@/utils/payhere', () => ({
  __esModule: true,
  createPayment: jest.fn(async () => ({})),
}))

describe('Checkout', () => {
  it('renders checkout form and payhere button', () => {
    render(
      <Checkout
        items={[
          {
            product: {
              id: 'p1',
              name: 'Ruby',
              price: 1000,
              image_url: 'https://example.com/ruby.png',
              images: ['https://example.com/ruby.png'],
              category: 'Gemstone',
              stock: 5,
              stock_quantity: 5,
              active: true,
              is_active: true,
              created_at: new Date().toISOString(),
              description: 'A beautiful ruby',
            },
            quantity: 1,
          },
        ]}
        onOrderComplete={jest.fn()}
      />
    )

    expect(screen.getByText(/Checkout/i)).toBeInTheDocument()
    expect(screen.getByText(/Ruby/i)).toBeInTheDocument()
    // PayHere button renders even if disabled; aria-label includes total.
    expect(screen.getByRole('button', { name: /Pay .* LKR/i })).toBeInTheDocument()
  })
})
