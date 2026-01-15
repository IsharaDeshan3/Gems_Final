import { render, screen } from '@testing-library/react'
import ExclusiveCard from '@/components/ExclusiveCard'

describe('ExclusiveCard', () => {
  it('renders basic content', () => {
    render(
      <ExclusiveCard
        id={1}
        title="Exclusive"
        description="A special item"
        image="https://example.com/x.png"
      />
    )

    expect(screen.getByText('Exclusive')).toBeInTheDocument()
    expect(screen.getByText('A special item')).toBeInTheDocument()
  })
})
