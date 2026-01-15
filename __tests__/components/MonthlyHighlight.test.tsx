/// <reference types="jest" />
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MonthlyHighlight from '@/components/MonthlyHighlight'

describe('MonthlyHighlight', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders title/subtitle and empty state when no product provided', () => {
    render(<MonthlyHighlight pageTitle="The Royal Gems" pageSubtitle="Collection" product={null} />)

    expect(screen.getByText('The Royal Gems')).toBeInTheDocument()
    expect(screen.getByText('Collection')).toBeInTheDocument()
    expect(screen.getByText(/No highlight selected yet/i)).toBeInTheDocument()
  })

  it('renders product and cycles images', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    render(
      <MonthlyHighlight
        pageTitle="The Royal Jewellery"
        pageSubtitle="Collection"
        product={{
          id: 'p1',
          name: 'Test Product',
          price: 1999,
          image_url: 'https://example.com/1.png',
          images: ['https://example.com/1.png', 'https://example.com/2.png'],
          category: 'Test',
          stock: 1,
          stock_quantity: 1,
          active: true,
          is_active: true,
          created_at: new Date().toISOString(),
          description: 'A test product',
        }}
        onPrimaryCta={jest.fn()}
      />
    )

    expect(screen.getByText('Test Product')).toBeInTheDocument()

    // dot buttons for thumbnails
    const dotButtons = screen.getAllByRole('button', { name: /Show image/i })
    expect(dotButtons.length).toBe(2)

    // click 2nd image
    await user.click(dotButtons[1])

    // ensure an img exists with the second src (mocked next/image renders <img>)
    const imgs = screen.getAllByRole('img')
    expect(imgs.some((img) => (img as HTMLImageElement).src.includes('2.png'))).toBe(true)

    // auto-rotate
    act(() => {
      jest.advanceTimersByTime(3600)
    })
    const imgsAfter = screen.getAllByRole('img')
    expect(imgsAfter.length).toBeGreaterThan(0)
  })
})
