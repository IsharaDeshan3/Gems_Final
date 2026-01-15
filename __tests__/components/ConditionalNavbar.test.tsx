import { render, screen } from '@testing-library/react'
import ConditionalNavbar from '@/components/ConditionalNavbar'

describe('ConditionalNavbar', () => {
  it('renders navbar on non-admin routes', () => {
    render(<ConditionalNavbar />)
    expect(screen.getByText(/Royal Gems/i)).toBeInTheDocument()
  })
})
