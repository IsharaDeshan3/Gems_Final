/// <reference types="jest" />
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

describe('components/ui smoke', () => {
  it('renders Alert primitives', () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders Avatar primitives', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="A" />
        <AvatarFallback>AF</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('AF')).toBeInTheDocument()
  })

  it('renders Badge', () => {
    render(<Badge>Badge</Badge>)
    expect(screen.getByText('Badge')).toBeInTheDocument()
  })

  it('renders Button', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument()
  })

  it('renders Card primitives', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>CardTitle</CardTitle>
          <CardDescription>CardDesc</CardDescription>
        </CardHeader>
        <CardContent>CardContent</CardContent>
        <CardFooter>CardFooter</CardFooter>
      </Card>
    )
    expect(screen.getByText('CardTitle')).toBeInTheDocument()
    expect(screen.getByText('CardDesc')).toBeInTheDocument()
    expect(screen.getByText('CardContent')).toBeInTheDocument()
    expect(screen.getByText('CardFooter')).toBeInTheDocument()
  })

  it('renders Checkbox', () => {
    render(<Checkbox aria-label="checkbox" />)
    expect(screen.getByRole('checkbox', { name: 'checkbox' })).toBeInTheDocument()
  })

  it('renders Dialog primitives', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button type="button">Open</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>DialogTitle</DialogTitle>
            <DialogDescription>DialogDesc</DialogDescription>
          </DialogHeader>
          <DialogFooter>DialogFooter</DialogFooter>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders DropdownMenu primitives', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('renders Form wrapper', () => {
    function TestFormWrapper() {
      const form = useForm();
      return <Form {...form}>{null}</Form>;
    }

    render(<TestFormWrapper />);
    // Just ensure it doesn't throw.
    expect(true).toBe(true);
  });

  it('renders Input/Label/Textarea', () => {
    render(
      <div>
        <Label htmlFor="x">X</Label>
        <Input id="x" defaultValue="v" />
        <Textarea aria-label="t" defaultValue="a" />
      </div>
    )
    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.getByDisplayValue('v')).toBeInTheDocument()
    expect(screen.getByDisplayValue('a')).toBeInTheDocument()
  })

  it('renders Select primitives', () => {
    render(
      <Select defaultValue="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    )
    // Trigger exists; content is portal-based and may not render until opened.
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders Table primitives', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })
})
