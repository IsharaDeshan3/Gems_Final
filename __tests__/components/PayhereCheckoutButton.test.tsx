import { render, screen } from '@testing-library/react'
import PayhereCheckoutButton from '@/components/PayhereCheckoutButton'

describe('PayhereCheckoutButton', () => {
  it('renders a checkout button', () => {
    render(
      <PayhereCheckoutButton
        checkout={{
          first_name: 'A',
          last_name: 'B',
          email: 'a@example.com',
          phone: '000',
          address: 'addr',
          city: 'city',
          country: 'Sri Lanka',
          amount: 100,
          currency: 'LKR',
          order_id: 'o1',
        } as any}
        isProcessing={false}
        total={100}
        isValid={true}
      />
    )

    expect(screen.getByRole('button', { name: /Pay 100\.00 LKR/i })).toBeInTheDocument()
    expect(screen.getByText(/Pay with PayHere/i)).toBeInTheDocument()
  })
})
