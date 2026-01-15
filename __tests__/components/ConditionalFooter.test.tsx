import { render, screen } from '@testing-library/react'
import ConditionalFooter from '@/components/ConditionalFooter'

describe('ConditionalFooter', () => {
  it('renders footer on non-admin routes', () => {
    render(<ConditionalFooter />)
    // next/dynamic is mocked to render the loading component.
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })
})
