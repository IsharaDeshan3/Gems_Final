import { render, screen } from '@testing-library/react'
import ITemDisplayCard from '@/components/ITemDisplayCard'

describe('ITemDisplayCard', () => {
  it('renders item card', () => {
    render(
      <ITemDisplayCard
        title="Test"
        image="https://example.com/a.png"
        description="Desc"
      />
    )

    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('Desc')).toBeInTheDocument()
  })
})
