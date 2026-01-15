import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

describe('Navbar', () => {
  it('renders primary navigation links', () => {
    render(<Navbar />)

    expect(screen.getByText('Royal Gems')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Gems/i })).toHaveAttribute('href', '/gems')
    expect(screen.getByRole('link', { name: /Jewellery/i })).toHaveAttribute('href', '/jewellery')
  })

  it('does not render the removed separate hero buttons', () => {
    render(<Navbar />)

    // There are still nav links named Gems/Jewellery; we specifically ensure no extra button elements exist.
    const buttons = screen.queryAllByRole('button', { name: /gems|jewellery/i })
    expect(buttons.length).toBe(0)
  })
})
