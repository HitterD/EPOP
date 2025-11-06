import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input Component', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    render(<Input placeholder="Type here" />)
    const input = screen.getByPlaceholderText('Type here')
    
    await userEvent.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled" />)
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" placeholder="Password" />)
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />)
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-class')
  })

  it('handles onChange event', async () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} placeholder="Change test" />)
    
    await userEvent.type(screen.getByPlaceholderText('Change test'), 'test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports ref forwarding', () => {
    const ref = jest.fn()
    render(<Input ref={ref} placeholder="Ref test" />)
    expect(ref).toHaveBeenCalled()
  })
})
