import { render, screen } from '@testing-library/react'
import FooterPage from '@/components/FooterPage'

describe('FooterPage', () => {
  it('renders without crashing', () => {
    render(<FooterPage />)
    // footer typically contains the brand name somewhere
    expect(screen.getByText(/Royal Gems/i)).toBeInTheDocument()
  })
})
